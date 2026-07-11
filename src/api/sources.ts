export interface Source {
  source_name: string;
  source_domain: string;
  trust_score: number;
  trust_score_explanation: string;
  validated_count: number;
  invalidated_count: number;
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
