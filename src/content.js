/**
 * Source Reliability Plugin - content script
 *
 * Runs on Google search results pages. For each organic result, it looks up
 * the publishing domain in the local reliability database and injects a
 * trust score badge next to the result title. Clicking the badge opens a
 * small panel with the explanation and "agree / disagree" voting controls
 * (the participatory / nice-to-have layer).
 */

(function () {
  "use strict";

  const STORAGE_KEYS = {
    ENABLED: "srp_enabled",
    VOTES: "srp_votes",
  };

  let domainIndex = null; // Map<domain, sourceEntry>
  let votesCache = {}; // { [domain]: { userVote: 'agree'|'disagree'|null } }

  function normalizeDomain(hostname) {
    return hostname.replace(/^www\./i, "").toLowerCase();
  }

  async function isEnabled() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ENABLED);
    return result[STORAGE_KEYS.ENABLED] !== false; // default true
  }

  async function loadDatabase() {
    const url = chrome.runtime.getURL("data/sources.json");
    const res = await fetch(url);
    const sources = await res.json();
    const map = new Map();
    sources.forEach((s) => map.set(s.source_domain.toLowerCase(), s));
    return map;
  }

  async function loadVotes() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.VOTES);
    return result[STORAGE_KEYS.VOTES] || {};
  }

  async function saveVote(domain, vote) {
    votesCache[domain] = votesCache[domain] || {};
    votesCache[domain].userVote = vote;
    await chrome.storage.local.set({ [STORAGE_KEYS.VOTES]: votesCache });
  }

  function scoreClass(score) {
    if (score === null || score === undefined) return "srp-badge--unknown";
    if (score >= 70) return "srp-badge--high";
    if (score >= 40) return "srp-badge--medium";
    return "srp-badge--low";
  }

  function closePopover() {
    const existing = document.querySelector(".srp-popover");
    if (existing) existing.remove();
  }

  function buildPopover(entry, domain, badgeEl) {
    closePopover();

    const panel = document.createElement("div");
    panel.className = "srp-popover";

    const title = document.createElement("div");
    title.className = "srp-popover__title";
    title.textContent = entry ? entry.source_name : domain;
    panel.appendChild(title);

    const explanation = document.createElement("div");
    explanation.className = "srp-popover__explanation";
    explanation.textContent = entry
      ? entry.trust_score_explanation
      : "This domain is not yet in the reliability database. Add it to data/sources.json.";
    panel.appendChild(explanation);

    if (entry) {
      const baseValidated = entry.validated_count || 0;
      const baseInvalidated = entry.invalidated_count || 0;
      const localVote = (votesCache[domain] || {}).userVote || null;
      const validated = baseValidated + (localVote === "agree" ? 1 : 0);
      const invalidated = baseInvalidated + (localVote === "disagree" ? 1 : 0);

      const counts = document.createElement("div");
      counts.className = "srp-popover__counts";
      counts.textContent = `${validated} agree - ${invalidated} disagree`;
      panel.appendChild(counts);

      const actions = document.createElement("div");
      actions.className = "srp-popover__actions";

      const agreeBtn = document.createElement("button");
      agreeBtn.className = "srp-vote-btn srp-vote-btn--agree";
      agreeBtn.textContent = localVote === "agree" ? "✓ Agreed" : "Agree";
      agreeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await saveVote(domain, localVote === "agree" ? null : "agree");
        buildPopover(entry, domain, badgeEl);
      });

      const disagreeBtn = document.createElement("button");
      disagreeBtn.className = "srp-vote-btn srp-vote-btn--disagree";
      disagreeBtn.textContent =
        localVote === "disagree" ? "✓ Disagreed" : "Disagree";
      disagreeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await saveVote(domain, localVote === "disagree" ? null : "disagree");
        buildPopover(entry, domain, badgeEl);
      });

      actions.appendChild(agreeBtn);
      actions.appendChild(disagreeBtn);
      panel.appendChild(actions);

      const note = document.createElement("div");
      note.className = "srp-popover__note";
      note.textContent =
        "Votes are stored locally in your browser, not sent anywhere.";
      panel.appendChild(note);
    }

    document.body.appendChild(panel);

    const rect = badgeEl.getBoundingClientRect();
    panel.style.top = `${window.scrollY + rect.bottom + 6}px`;
    panel.style.left = `${window.scrollX + rect.left}px`;

    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener("click", function handler(evt) {
        if (!panel.contains(evt.target) && evt.target !== badgeEl) {
          panel.remove();
          document.removeEventListener("click", handler);
        }
      });
    }, 0);
  }

  function createBadge(entry, domain) {
    const badge = document.createElement("span");
    badge.className = `srp-badge ${scoreClass(entry ? entry.trust_score : null)}`;
    badge.textContent = entry ? `${entry.trust_score}/100` : "no data";
    badge.title = entry
      ? `${entry.source_name}: ${entry.trust_score_explanation}`
      : `${domain} is not in the reliability database yet`;

    badge.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      buildPopover(entry, domain, badge);
    });

    return badge;
  }

  function injectBadges() {
    const headings = document.querySelectorAll("h3");
    headings.forEach((h3) => {
      if (h3.dataset.srpProcessed) return;
      const link = h3.closest("a[href]");
      if (!link || !link.href || !link.href.startsWith("http")) return;

      let hostname;
      try {
        hostname = new URL(link.href).hostname;
      } catch (err) {
        return;
      }

      h3.dataset.srpProcessed = "true";
      const domain = normalizeDomain(hostname);
      const entry = domainIndex.get(domain) || null;
      const badge = createBadge(entry, domain);

      const container = h3.parentElement || h3;
      container.insertBefore(badge, h3.nextSibling);
    });
  }

  async function init() {
    if (!(await isEnabled())) return;
    try {
      [domainIndex, votesCache] = await Promise.all([
        loadDatabase(),
        loadVotes(),
      ]);
    } catch (err) {
      console.error("[Source Reliability Plugin] Failed to load database", err);
      return;
    }

    injectBadges();

    // Google search results load progressively / via infinite scroll in some
    // layouts, so keep watching the DOM for new result blocks.
    const observer = new MutationObserver(() => injectBadges());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
