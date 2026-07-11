import type { Source } from "../api/sources";
import { openPanel } from "./panelState";

const HEART_ICON = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S4 15.9 4 10.2C4 7.3 6.2 5 9 5c1.5 0 2.9.7 3.8 1.9C13.7 5.7 15.1 5 16.6 5c2.8 0 5 2.3 5 5.2 0 5.7-8 10.3-8 10.3z"/></svg>`;

function normalizeDomain(hostname: string) {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

// Prefer the workbook's own trust_level ("Very high"/"High"/"Medium"/"Low"/
// "Very low"/"Unclear") so the badge colour always agrees with the
// qualifier shown when the panel opens for the same source.
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
  badge.innerHTML = `${HEART_ICON}<span>${entry ? `${entry.trust_score}/100` : "no data"}</span>`;
  badge.title = entry
    ? `${entry.source_name} - click for details`
    : `${domain} is not in the reliability database yet`;

  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel(domain, entry);
  });

  return badge;
}

export function injectBadges(domainIndex: Map<string, Source>) {
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

    const container = h3.parentElement ?? h3;
    container.insertBefore(badge, h3.nextSibling);
  });
}

export function injectBadgeStyles(css: string) {
  if (document.getElementById("decode-badge-styles")) return;
  const style = document.createElement("style");
  style.id = "decode-badge-styles";
  style.textContent = css;
  document.head.appendChild(style);
}
