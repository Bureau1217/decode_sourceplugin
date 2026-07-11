import { createApp } from "vue";
import App from "./App.vue";
import panelStyles from "./panel.css?inline";
import badgeStyles from "./badge.css?inline";
import { fetchSources, type Source } from "../api/sources";
import { injectBadges, injectBadgeStyles } from "./badges";
import { loadVotes } from "./votesState";

// The side panel is rendered by Vue inside a shadow root, isolated from
// Google's own styles. The inline badges next to each result stay as plain
// DOM (see badges.ts) since they need to live inside Google's real markup.
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
  mountShadowApp();
  await loadVotes();

  let domainIndex: Map<string, Source>;
  try {
    const sources = await fetchSources();
    domainIndex = new Map(
      sources.map((s) => [s.source_domain.toLowerCase(), s])
    );
  } catch (err) {
    console.error("[DE.CO.DE Plugin] failed to load source database", err);
    domainIndex = new Map();
  }

  injectBadges(domainIndex);

  // Google search results can load progressively, so keep watching for new
  // result blocks and badge them too.
  const observer = new MutationObserver(() => injectBadges(domainIndex));
  observer.observe(document.body, { childList: true, subtree: true });
}

init();
