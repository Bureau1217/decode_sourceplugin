# decode_sourceplugin — DE.CO.DE Source Reliability Plugin

A browser extension (Manifest V3, Chrome / Edge / other Chromium browsers)
that helps people evaluate the reliability of online sources while browsing
Google search results. Next to each result, the plugin shows a trust score
badge; clicking it opens a side panel with the score, the reasoning behind
it, and an Agree / Disagree control — a lightweight, participatory layer of
civic verification.

## Stack

- **Vite** + **@crxjs/vite-plugin** — bundles the extension (content script,
  popup, options page, background worker) and gives HMR in dev.
- **Vue 3** — powers the side panel, popup, and options page UI.
- **Kirby CMS** (planned, not built yet) — will eventually be where the team
  adds/edits sources through a normal editorial interface, instead of hand-
  editing a JSON file. The data layer (`src/api/sources.ts`) is already
  shaped so this is a small change, not a rewrite, when the CMS is ready.

## Install & run

```bash
npm install
npm run dev      # dev build with HMR, outputs to dist/
npm run build    # production build, outputs to dist/
```

Then, to load it in the browser:

1. Open `chrome://extensions` (or the Edge equivalent).
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist/` folder (not the repo root).
4. Go to `https://www.google.com`, search for anything, and trust badges
   should appear next to each result title.

`dist/` is a build artifact and is gitignored — always run `npm run build`
(or `npm run dev`) before loading the extension.

## How it works

1. `src/content/main.ts` runs on `google.com/search` pages. It loads the
   reliability database (see below), then `src/content/badges.ts` scans
   result titles and injects a small colored pill next to each one:
   green ≥ 70, yellow 40–69, red < 40, grey = "no data" for domains not yet
   in the database.
2. Clicking a badge opens the **DE.CO.DE side panel** — a Vue component tree
   mounted once inside a shadow root (`src/content/App.vue` /
   `components/SidePanel.vue`), isolated from Google's own styles. It shows:
   - the source name/domain, trust score, a progress bar, and the
     workbook's own `trust_level` label ("Very high", "High", "Medium",
     "Low", "Very low") next to the score - badge colour and qualifier
     always agree since both read the same field
   - the written analysis, an "Evidence" list of links (from
     `authority_sources`) backing the score, and a "see more relevant
     sources on this subject" link when other sources share the same
     `topic` tag
   - community agree/disagree counts, with a compact `+`/`−` control
     (rather than two full-width buttons) to record your own vote
   - an "i" info button in the header that expands a short explanation of
     the scoring methodology and its limits (transparency panel)
3. Votes are stored locally per-browser via `chrome.storage.local`
   (`src/content/votesState.ts`) and layered on top of the database's
   `validated_count` / `invalidated_count` when displaying totals. Nothing
   is sent to a server yet — see "Kirby CMS integration" below for what
   changes that.
4. The toolbar popup (`src/popup`) toggles badges on/off and links to the
   options page. The options page (`src/options`) lists the full database,
   and can be opened pre-filtered to a topic (via the panel's related-
   sources link, which passes `?topic=` in the URL).

## Project structure

```
decode_sourceplugin/
├── src/
│   ├── manifest.config.ts     Manifest V3 definition (crxjs)
│   ├── content/
│   │   ├── main.ts              Entry point: loads data, mounts panel, injects badges
│   │   ├── badges.ts             Plain-DOM badge injection (lives in Google's real page)
│   │   ├── panelState.ts         Shared reactive state (badges <-> Vue panel)
│   │   ├── votesState.ts         Local participatory vote storage
│   │   ├── App.vue               Root Vue component (mounted in a shadow root)
│   │   ├── components/SidePanel.vue
│   │   ├── badge.css              Badge styles (injected into the page <head>)
│   │   └── panel.css              Panel styles (injected into the shadow root)
│   ├── popup/                   Toolbar popup (Vue)
│   ├── options/                 Full database view (Vue)
│   ├── background/index.ts      Service worker (defaults + open-options relay)
│   ├── api/sources.ts           Data access seam — see Kirby section below
│   ├── composables/useSources.ts
│   └── styles/tokens.css        Shared design tokens (colors, font)
├── public/
│   ├── data/sources.json         Mock reliability database (see schema below)
│   └── icons/
├── vite.config.ts
└── package.json
```

## Reliability database (schema)

One row = one source, in `public/data/sources.json` (wrapped in a
Kirby-style API envelope — see below). The current data comes from the
**DECODE Project 3 workbook**
(`DECODE_Project_3_Source_Reliability_Plugin.xlsx`, "Source Database - To
fill" sheet) — 99 sources, converted with `/tmp/transform.py`-style logic
(sanitized domains, parsed evidence URLs). See "Importing from the
workbook" below for how to re-run this when the sheet is updated.

| Field                       | Type            | Notes                                                                 |
| ---------------------------- | --------------- | ---------------------------------------------------------------------- |
| `source_name`                 | Text            | —                                                                       |
| `source_domain`               | Text / domain   | Cleaned: no `https://`, no `www.`, no path                              |
| `source_type`                 | Text            | e.g. "News organisation", "Public broadcaster", "Satirical source"      |
| `country_or_region`           | Text            | —                                                                       |
| `language`                    | Text            | —                                                                       |
| `topic`                       | Text            | From the sheet's `topic_area` column - powers "see more relevant sources on this subject" |
| `trust_score`                 | Number (0–100)  | From the sheet's `trust_score_100` (already normalised)                 |
| `trust_score_raw`             | Number          | The raw per-scale score before normalisation                           |
| `score_scale`                 | Text            | e.g. "5-point" - all current rows use this                              |
| `trust_level`                 | Text            | "Very high" / "High" / "Medium" / "Low" / "Very low" / "Unclear" - drives badge colour and the panel's qualifier label |
| `trust_score_explanation`     | Text            | Shown in the panel's Analysis section                                  |
| `editorial_standards`, `transparency`, `correction_policy`, `ownership_funding`, `bias_notes` | Text | Evaluation evidence fields from the sheet; shown on the options page, not the compact panel |
| `authority_sources`           | Text[]          | Parsed from the sheet's space/line-separated URL list; rendered as links in the panel's Evidence section |
| `last_checked_date`           | Text (ISO date) | —                                                                       |
| `status`, `source_id`, `student_owner` | Text  | Workbook bookkeeping, not shown in the extension UI                     |
| `validated_count`, `invalidated_count` | Number | Not in this workbook (no Participatory Feedback sheet in this version) - seeded at 0, since votes are tracked locally by the extension anyway |

### Importing from the workbook

Re-run `python3 scripts/import_from_xlsx.py path/to/workbook.xlsx` whenever
the sheet is updated - it regenerates `public/data/sources.json` from
scratch (sheet `Source Database - To fill`, header row 5, data from row 6).
What it does:

1. Read rows where any cell is non-empty; skip rows with no `source_domain`.
2. Clean `source_domain`: strip `http(s)://`, strip leading `www.`, cut
   anything from the first `/` onward, lowercase.
3. Parse `authority_sources` by splitting on whitespace and keeping tokens
   that start with `http` (a few rows have two URLs space-separated with no
   other delimiter).
4. Map `topic_area` → `topic`, `trust_score_100` → `trust_score`, keep the
   rest close to the sheet's own column names.

**QA notes from the current import** (99 of 100 rows made it in):
- `SRC_098` was skipped — no `source_domain` filled in, so the plugin has
  no way to match it to a search result. Worth fixing in the sheet and
  re-importing.
- 20 domains had a protocol/`www.`/path that got stripped automatically
  (e.g. `www.jstor.org` → `jstor.org`, `blick.ch/fr/` → `blick.ch`) — no
  action needed, just noting the sheet isn't 100% clean yet.
- 2 rows (`SRC_005`, `SRC_008`) are still marked `To verify` rather than
  `Ready` in the `status` column but were imported anyway; worth a look
  before this goes further.
- 1 row (`SRC_006`) had no `trust_score_explanation` — a placeholder string
  was substituted so the panel doesn't show blank text.
- No duplicate domains, no out-of-range scores.

Scores follow the workbook's own Scoring Rubric sheet (editorial standards,
transparency, correction practice, evidence quality, news/opinion
separation, disinformation risk) — kept as-is rather than re-derived.

## Kirby CMS integration (not built yet)

The plan is for the team to manage this dataset through a **Kirby CMS**
instead of editing JSON by hand. Nothing Kirby-specific has been built —
per current scope, that's deliberately out of this pass — but the codebase
is already set up for a clean handoff:

- `src/api/sources.ts` is the single function (`fetchSources()`) that every
  part of the extension calls to get the database. Today it `fetch()`es the
  bundled `public/data/sources.json`. When the CMS exists, only this
  function's body needs to change (e.g. to call a Kirby route like
  `${KIRBY_BASE_URL}/api/pages/sources/children`).
- The mock JSON is already wrapped in a Kirby-style response envelope
  (`{ code, status, result: { data: [...] } }`), matching what Kirby's API
  typically returns for a collection, so the eventual swap is close to a
  drop-in replacement rather than a reshaping exercise.
- The participatory vote counts (`validated_count` / `invalidated_count`)
  are currently local-only (`chrome.storage.local`). Making them a shared,
  cross-user tally will also need a small write-side API once the CMS/
  backend exists — out of scope here too.

## Distribution

Two paths, not mutually exclusive:

- **Zip + load unpacked** — run `npm run build`, zip the `dist/` folder
  (contents at the zip root, not nested in a `dist/` subfolder), and hand
  it to testers. They unzip it, open `chrome://extensions`, enable
  Developer mode, and click "Load unpacked" on the unzipped folder.
  Available immediately, no review, no account.
- **Chrome Web Store (unlisted)** — real one-click "Add to Chrome" install
  for end users, no developer mode needed. Requires a one-time $5 Google
  developer account and goes through Google's review (typically a few
  business days). Draft listing copy, permissions justification, and a
  privacy policy are in `store/LISTING.md` and `store/PRIVACY_POLICY.md` —
  upload the same `dist/` zip as the package. Screenshots still need to be
  captured from a real running instance of the extension.

## License

No license specified — add one (e.g. MIT) if this project will be shared or
reused publicly.
