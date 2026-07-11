export interface Source {
  source_name: string;
  source_domain: string;
  trust_score: number;
  trust_score_explanation: string;
  validated_count: number;
  invalidated_count: number;
  /**
   * Not part of the original 3.1 database spec - added to power the
   * "see more relevant sources on this subject" link in the side panel.
   * A loose topic tag (e.g. "climate", "news", "satire"). Once the Kirby
   * CMS exists this would likely become a real taxonomy/tag field the
   * team manages there instead of a free string.
   */
  topic?: string;
}

/**
 * The mock dataset is intentionally shaped like a Kirby CMS API response
 * envelope ({ code, status, result: { data } }) - that's the shape Kirby's
 * built-in API / a custom Kirby route typically returns for a collection of
 * pages. Matching it now means that once the CMS exists, this file is the
 * only place that needs to change.
 */
interface KirbyLikeResponse {
  code: number;
  status: string;
  result: { data: Source[] };
}

/**
 * Single access point for the source reliability database.
 *
 * Today: reads the static mock dataset bundled at `public/data/sources.json`.
 *
 * Later (once the Kirby CMS is live): replace the body of this function with
 * a fetch against the CMS, e.g.
 *
 *   const res = await fetch(`${KIRBY_BASE_URL}/api/pages/sources/children`)
 *
 * Nothing else in the extension (badges, side panel, popup, options page)
 * needs to know where the data actually comes from - they all go through
 * `fetchSources()`.
 */
export async function fetchSources(): Promise<Source[]> {
  const url = chrome.runtime.getURL("data/sources.json");
  const res = await fetch(url);
  const json = (await res.json()) as KirbyLikeResponse;
  return json.result?.data ?? [];
}

/**
 * Other sources sharing the same topic tag, excluding the source itself.
 * Used for the "see more relevant sources on this subject" link. This is a
 * simple client-side filter for now - a real recommendation (by actual
 * article subject rather than a coarse per-source tag) would need either a
 * richer taxonomy from the CMS or a proper search index.
 */
export function relatedSources(all: Source[], current: Source): Source[] {
  if (!current.topic) return [];
  return all.filter(
    (s) => s.topic === current.topic && s.source_domain !== current.source_domain
  );
}
