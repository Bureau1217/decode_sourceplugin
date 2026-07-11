const STORAGE_KEYS = { ENABLED: "srp_enabled" };

async function init() {
  const { srp_enabled } = await chrome.storage.local.get(
    STORAGE_KEYS.ENABLED
  );
  const toggle = document.getElementById("enabledToggle");
  toggle.checked = srp_enabled !== false;

  toggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ [STORAGE_KEYS.ENABLED]: toggle.checked });
  });

  try {
    const url = chrome.runtime.getURL("data/sources.json");
    const res = await fetch(url);
    const sources = await res.json();
    document.getElementById("sourceCount").textContent = sources.length;
  } catch (err) {
    document.getElementById("sourceCount").textContent = "?";
  }

  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

init();
