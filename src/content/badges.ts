import type { Source } from "../api/sources";
import { openPanel } from "./panelState";

const HEART_ICON = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S4 15.9 4 10.2C4 7.3 6.2 5 9 5c1.5 0 2.9.7 3.8 1.9C13.7 5.7 15.1 5 16.6 5c2.8 0 5 2.3 5 5.2 0 5.7-8 10.3-8 10.3z"/></svg>`;

const OVERLAY_ID = "decode-badge-overlay";

/**
 * Badges are NOT inserted into Google's own result DOM. Google's SERP markup
 * contains elements with their own CSS transforms (e.g. a flipped
 * `transform: matrix(1,0,0,-1,0,0)` on some layout helper spans) that are
 * invisible until something is nested inside them - a badge inserted inline
 * inherited one of these and rendered upside down.
 *
 * Instead, each badge is an independent element appended to a dedicated
 * overlay layer on `document.body`, positioned with `position: absolute`
 * from the anchor's `getBoundingClientRect()`. This keeps the badge fully
 * isolated from whatever Google's markup happens to do around the anchor.
 */
function getOverlay(): HTMLElement {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "0";
    overlay.style.height = "0";
    overlay.style.overflow = "visible";
    document.body.appendChild(overlay);
  }
  return overlay;
}

interface TrackedBadge {
  anchor: HTMLElement;
  badge: HTMLElement;
}

const tracked: TrackedBadge[] = [];

function positionBadge(anchor: HTMLElement, badge: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const top = rect.top + window.scrollY + rect.height / 2;
  const left = rect.right + window.scrollX + 8;
  badge.style.position = "absolute";
  badge.style.top = `${top}px`;
  badge.style.left = `${left}px`;
  badge.style.transform = "translateY(-50%)";
}

export function repositionBadges() {
  tracked.forEach(({ anchor, badge }) => positionBadge(anchor, badge));
}

function normalizeDomain(hostname: string) {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function tierClass(entry: Source | null) {
  const level = entry?.trust_level?.toLowerCase();
  if (level) {
    if (level === "very high" || level === "high") return "decode-badge--high";
    if (level === "medium") return "decode-badge--medium";
    if (level === "low" || level === "very low") return "decode-badge--low";
    return "decode-badge--unknown";
  }
  const score = entry?.trust_score ?? null;
  if (score === null) return "decode-badge--unknown";
  if (score >= 70) return "decode-badge--high";
  if (score >= 40) return "decode-badge--medium";
  return "decode-badge--low";
}

function createBadge(domain: string, entry: Source | null) {
  const badge = document.createElement("span");
  badge.className = `decode-badge ${tierClass(entry)}`;
  badge.style.pointerEvents = "auto";
  const label = entry ? `${entry.trust_score}/100` : "Rate this source";
  badge.innerHTML = `${HEART_ICON}<span>${label}</span>`;
  badge.title = entry
    ? `${entry.source_name} - click for details`
    : `${domain} isn't in the reliability database yet - click to suggest a score`;

  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel(domain, entry);
  });

  return badge;
}

export function injectBadges(domainIndex: Map<string, Source>) {
  const overlay = getOverlay();
  let addedNew = false;

  document.querySelectorAll("h3").forEach((h3) => {
    const el = h3 as HTMLElement;
    if (el.dataset.decodeProcessed) return;

    const link = h3.closest("a[href]") as HTMLAnchorElement | null;
    if (!link || !link.href.startsWith("http")) return;

    let hostname: string;
    try {
      hostname = new URL(link.href).hostname;
    } catch {
      return;
    }

    el.dataset.decodeProcessed = "true";
    const domain = normalizeDomain(hostname);
    const entry = domainIndex.get(domain) ?? null;
    const badge = createBadge(domain, entry);
    overlay.appendChild(badge);
    tracked.push({ anchor: el, badge });
    positionBadge(el, badge);
    addedNew = true;
  });

  if (addedNew) {
    // Positions of earlier badges can shift as later content
    // (thumbnails, "top stories" carousels) finishes loading.
    repositionBadges();
  }
}

export function injectBadgeStyles(css: string) {
  if (document.getElementById("decode-badge-styles")) return;
  const style = document.createElement("style");
  style.id = "decode-badge-styles";
  style.textContent = css;
  document.head.appendChild(style);
}
