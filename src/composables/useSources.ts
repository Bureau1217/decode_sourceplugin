import { ref } from "vue";
import { fetchSources, type Source } from "../api/sources";

export function useSources() {
  const sources = ref<Source[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      sources.value = await fetchSources();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load sources";
    } finally {
      loading.value = false;
    }
  }

  load();

  return { sources, loading, error, reload: load };
}
