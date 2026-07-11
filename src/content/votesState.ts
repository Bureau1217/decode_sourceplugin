import { reactive } from "vue";

export type Vote = "agree" | "disagree" | null;

/**
 * Participatory votes, keyed by domain. Stored in chrome.storage.local so
 * they persist for this browser only - there is no shared backend yet.
 * Once a real API exists (likely alongside the Kirby CMS), this is the
 * module to point at it instead of chrome.storage.
 */
export const votes = reactive<Record<string, Vote>>({});

export async function loadVotes() {
  const { srp_votes } = await chrome.storage.local.get("srp_votes");
  Object.assign(votes, srp_votes || {});
}

export async function setVote(domain: string, vote: Vote) {
  votes[domain] = vote;
  await chrome.storage.local.set({ srp_votes: { ...votes } });
}
