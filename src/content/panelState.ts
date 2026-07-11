import { reactive } from "vue";
import type { Source } from "../api/sources";

/**
 * Shared reactive state between the plain-DOM badges (badges.ts, which
 * live directly in Google's page and are not Vue components) and the
 * Vue-rendered side panel (mounted once, inside a shadow root). Clicking a
 * badge calls `openPanel`, and the panel component just reacts to this
 * state changing.
 */
export const panelState = reactive<{
  visible: boolean;
  domain: string;
  source: Source | null;
}>({
  visible: false,
  domain: "",
  source: null,
});

export function openPanel(domain: string, source: Source | null) {
  panelState.domain = domain;
  panelState.source = source;
  panelState.visible = true;
}

export function closePanel() {
  panelState.visible = false;
}
