import { reactive } from "vue";

export interface Suggestion {
  score: number;
  submittedAt: string;
}

/**
 * Local, per-browser suggestions for domains that aren't in the database
 * yet ("Rate this source" badges). There's no backend to send these to -
 * they're saved via chrome.storage.local as a starting point for whoever
 * maintains the database (today: manual review of the workbook; later:
 * presumably reviewed through the Kirby CMS).
 */
export const suggestions = reactive<Record<string, Suggestion>>({});

export async function loadSuggestions() {
  const { srp_suggestions } = await chrome.storage.local.get(
    "srp_suggestions"
  );
  Object.assign(suggestions, srp_suggestions || {});
}

export async function submitSuggestion(domain: string, score: number) {
  suggestions[domain] = { score, submittedAt: new Date().toISOString() };
  await chrome.storage.local.set({
    srp_suggestions: { ...suggestions },
  });
}
