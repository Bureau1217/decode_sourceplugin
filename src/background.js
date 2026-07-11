/**
 * Source Reliability Plugin - background service worker
 *
 * Sets sensible defaults on install. All heavy lifting happens in the
 * content script; this worker just keeps shared state (enabled flag,
 * local participatory votes) initialized.
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      srp_enabled: true,
      srp_votes: {},
    });
  }
});
