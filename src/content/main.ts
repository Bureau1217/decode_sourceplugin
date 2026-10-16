import { createApp } from "vue";
import App from "./App.vue";
import panelStyles from "./panel.css?inline";
import badgeStyles from "./badge.css?inline";
import { fetchSources, type Source } from "../api/sources";
import { injectBadges, injectBadgeStyles, repositionBadges } from "./badges";
import { loadVotes } from "./votesState";
import { loadSuggestions } from "./suggestionsState";
import { allSources } from "./sourcesState";
import { injectFonts } from "./fonts";

// The side panel is rendered by Vue inside a shadow root, isolated from
// Google's own styles. Badges are also independent of Google's own markup
// (see badges.ts) - they're positioned overlay elements, not nodes inserted
// into Google's result DOM, since that DOM contains elements with their own
// CSS transforms that a naively-inserted child would inherit.
function mountShadowApp() {
  const hostId = "decode-panel-host";
  if (document.getElementById(hostId)) return;

  const host = document.createElement("div");
  host.id = hostId;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = panelStyles;
  shadow.appendChild(styleEl);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);
  createApp(App).mount(mountPoint);
}

async function init() {
  const { srp_enabled } = await chrome.storage.local.get("srp_enabled");
  if (srp_enabled === false) return;

  injectBadgeStyles(badgeStyles);
  injectFonts();
  mountShadowApp();
  await Promise.all([loadVotes(), loadSuggestions()]);

  let domainIndex: Map<string, Source>;
  try {
    const sources = await fetchSources();
    allSources.value = sources;
    domainIndex = new Map(
      sources.map((s) => [s.source_domain.toLowerCase(), s])
    );
  } catch (err) {
    console.error("[DE.CO.DE Plugin] failed to load source database", err);
    domainIndex = new Map();
  }

  injectBadges(domainIndex);

  // Google search results can load progressively, so keep watching for new
  // result blocks (and reposition existing badges, since late-loading
  // thumbnails/carousels can shift anchors after the first paint).
  const observer = new MutationObserver(() => {
    injectBadges(domainIndex);
    repositionBadges();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Badges are position:absolute on document.body, so they already scroll
  // correctly with the page - only resize (which reflows Google's layout)
  // needs an explicit reposition.
  window.addEventListener("resize", repositionBadges);
}

init();
