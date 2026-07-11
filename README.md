# decode_sourceplugin — Source Reliability Plugin

A browser extension (Chrome / Edge / other Chromium browsers, Manifest V3)
that helps people evaluate the reliability of online sources while browsing
Google search results. Next to each result, the plugin shows a trust score
badge drawn from a pre-built reliability database. Clicking a badge shows the
reasoning behind the score and lets the user agree or disagree with it — a
lightweight, participatory layer of civic verification.

## Why

The goal isn't to declare a source "true" or "false," but to make source
credibility visible at the exact moment people are scanning search results —
encouraging a habit of checking who is publishing, not only what is published.

## How it works

1. `src/content.js` runs on `google.com/search` pages.
2. It reads `data/sources.json` (the reliability database) and matches each
   result's domain against it.
3. A colored badge (`XX/100`) is injected next to the result title:
   green ≥ 70, yellow 40–69, red < 40, grey = "no data" for domains not yet in
   the database.
4. Clicking a badge opens a panel with the `trust_score_explanation` and two
   buttons, Agree / Disagree, which is the nice-to-have participatory layer.
   Votes are stored locally in the browser (`chrome.storage.local`) and shown
   added on top of the database's `validated_count` / `invalidated_count`.

Nothing is sent to a server — this is a fully client-side prototype. Votes
only persist in the browser they were cast in, so treat them as a demo of the
UX rather than a real crowd-sourced tally. See "Next steps" below for how to
make voting shared across users.

## Install (load unpacked)

1. Open `chrome://extensions` (or the Edge equivalent).
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" and select the `decode_sourceplugin` folder.
4. Go to `https://www.google.com` and search for anything — badges should
   appear next to each result title.
5. Click the extension icon in the toolbar to toggle badges on/off or open
   the full source list.

## Project structure

```
decode_sourceplugin/
├── manifest.json          Chrome extension manifest (Manifest V3)
├── data/
│   └── sources.json        Reliability database (see schema below)
├── src/
│   ├── content.js           Injects badges + popover into Google SERPs
│   ├── content.css           Badge / popover styling
│   ├── background.js        Service worker, sets defaults on install
│   ├── popup.html/.js/.css   Toolbar popup (enable/disable, source count)
│   └── options.html/.js/.css Full read-only view of the database
└── icons/                   Toolbar icons (16/48/128px)
```

## 3.1 Source Reliability Database — `data/sources.json`

One row = one source. This is the file students/contributors fill in.

| Field label              | Type            | Example                                                                                   |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------ |
| `source_name`            | Text            | `Le Temps`                                                                                  |
| `source_domain`          | Text / domain   | `letemps.ch`                                                                                |
| `trust_score`            | Number / rating | `80` (out of 100)                                                                           |
| `trust_score_explanation`| Short text      | `Reliable newspaper with professional editorial standards, but still requires article-level verification.` |

Scores can be assigned by students according to clear, documented criteria,
or derived from a cross-check of existing authority sources, media rankings,
or fact-checking databases (e.g. NewsGuard, MBFC, Reporters Without Borders,
IFCN signatories, etc.). Keep the criteria consistent across the dataset so
scores are comparable.

To add a source, append an object to `data/sources.json`:

```json
{
  "source_name": "Example News",
  "source_domain": "example.com",
  "trust_score": 60,
  "trust_score_explanation": "Why this score was given.",
  "validated_count": 0,
  "invalidated_count": 0
}
```

Reload the extension (chrome://extensions → refresh icon) after editing the
file.

## 3.2 Participatory fields (nice-to-have)

| Field label        | Type   | Example |
| ------------------- | ------ | ------- |
| `validated_count`   | Number | `126`   |
| `invalidated_count` | Number | `18`    |

These are the seed counts baked into the dataset. The extension adds the
current browser's local vote on top of these when displaying totals in the
popover and in the options page table.

## Limitations & next steps

- Google's result page markup can change; `content.js` targets result titles
  (`h3` elements) rather than brittle class names, but selectors may need
  updates if Google changes its DOM structure.
- Votes are local-only (per browser, via `chrome.storage.local`). To make the
  participatory layer truly collective, `validated_count` / `invalidated_count`
  would need to be served from and written back to a shared backend (e.g. a
  small API + database) instead of a static JSON file.
- The dataset ships with a handful of example sources for demonstration.
  Replace/extend `data/sources.json` with the class's actual research.

## License

No license specified — add one (e.g. MIT) if this project will be shared or
reused publicly.
