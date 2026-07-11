/**
 * Background service worker. Keeps default storage values initialized and
 * relays "open options page" requests from the content script, since
 * chrome.runtime.openOptionsPage() is only reliable from an extension page
 * context (popup/background/options), not from content scripts.
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      srp_enabled: true,
      srp_votes: {},
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
  }
});
