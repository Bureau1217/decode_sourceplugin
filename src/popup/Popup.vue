<template>
  <div class="popup">
    <h1>DE.CO.DE Plugin</h1>
    <p class="subtitle">
      Trust scores appear next to sources in your Google search results.
    </p>

    <label class="toggle-row">
      <input type="checkbox" v-model="enabled" @change="onToggle" />
      <span>Show trust badges</span>
    </label>

    <div class="stat">
      <template v-if="loading">Loading...</template>
      <template v-else>{{ sources.length }} sources in the database</template>
    </div>

    <button @click="openOptions">View full source list</button>

    <p class="footer-note">
      Click a badge on Google to see the analysis, and to say whether you
      agree or disagree with the score.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSources } from "../composables/useSources";

const { sources, loading } = useSources();
const enabled = ref(true);

onMounted(async () => {
  const { srp_enabled } = await chrome.storage.local.get("srp_enabled");
  enabled.value = srp_enabled !== false;
});

async function onToggle() {
  await chrome.storage.local.set({ srp_enabled: enabled.value });
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}
</script>

<style scoped>
.popup {
  width: 260px;
  padding: 16px;
  font-family: var(--decode-font);
  color: var(--decode-ink);
}

h1 {
  font-size: 15px;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 12px;
  color: var(--decode-grey);
  margin: 0 0 12px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  cursor: pointer;
}

.stat {
  font-size: 12px;
  color: var(--decode-ink-soft);
  background: var(--decode-grey-light);
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 12px;
}

button {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--decode-border);
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 10px;
}
button:hover {
  background: #e8eaed;
}

.footer-note {
  font-size: 11px;
  color: #80868b;
  line-height: 1.4;
  margin: 0;
}
</style>
