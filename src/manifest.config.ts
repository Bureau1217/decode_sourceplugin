import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "../package.json";

// Manifest V3 definition, built with crxjs so Vite can bundle the content
// script, popup, and options page (and give us HMR in dev).
export default defineManifest({
  manifest_version: 3,
  name: "Source Reliability Plugin - DE.CO.DE",
  short_name: "DE.CO.DE Plugin",
  version: pkg.version,
  description:
    "Displays a trust score next to each source in Google search results, based on a community-maintained reliability database.",
  permissions: ["storage"],
  host_permissions: ["https://www.google.com/*", "https://google.com/*"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_title: "DE.CO.DE Plugin",
    default_icon: {
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  options_page: "src/options/index.html",
  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  content_scripts: [
    {
      matches: ["https://www.google.com/search*", "https://google.com/search*"],
      js: ["src/content/main.ts"],
      run_at: "document_idle",
    },
  ],
  web_accessible_resources: [
    {
      resources: ["data/sources.json"],
      matches: ["https://www.google.com/*"],
    },
    {
      // Panel webfonts, declared on Google's page by content/fonts.ts.
      resources: ["fonts/*.woff2"],
      matches: ["https://www.google.com/*", "https://google.com/*"],
    },
  ],
});
