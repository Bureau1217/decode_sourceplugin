# Chrome Web Store listing — draft copy

Use this when you get to the "Store listing" tab in the Chrome Web Store
Developer Dashboard (https://chrome.google.com/webstore/devconsole). Edit
freely — this is a starting draft, not final copy.

## Item name

Source Reliability Plugin — DE.CO.DE

## Summary (132 characters max)

See a trust score next to every source in your Google results, and vote on whether you agree with it.

## Description

DE.CO.DE is a browser extension that helps you evaluate the reliability of
online sources while you search. Next to each result on Google, it shows a
trust score badge (0–100) based on a maintained reliability database.

Click a badge to open a panel with:
- The trust score and a short written explanation of why the source got it
- A community evaluation section where you can say whether you agree or
  disagree with the score

The goal isn't to declare a source "true" or "false" — it's to make source
credibility visible at the exact moment you're scanning search results, so
you get in the habit of checking who's publishing, not only what's
published.

This is a student / civic-media-literacy project. The reliability database
is currently maintained manually; a content team manages it going forward.

## Category

Productivity (or "Social & Communication" — pick whichever fits your Web
Store account's available categories)

## Language

English

## Icon

128x128 — already generated at `public/icons/icon128.png` in the repo.
Store requires it uploaded separately as a square PNG.

## Screenshots (required: at least 1, 1280x800 or 640x400)

Ready: `store/screenshots/01-search-badge.png` and `store/screenshots/02-side-panel.png` (1280x800).

## Privacy policy URL

https://bureau1217.github.io/decode_sourceplugin/

## Promotional images

Optional for an unlisted listing — skip unless you're going public.

---

# Permissions justification

The Chrome Web Store review form asks you to justify each permission in
plain language. Suggested answers:

**`storage`**
"Used to remember whether badges are turned on, and to store the user's
local agree/disagree votes on trust scores."

**Host permission: `https://www.google.com/*`, `https://google.com/*`**
"The extension reads the search results DOM on google.com to find each
result's title and link, so it can display a trust score badge next to it.
It does not read or transmit the user's search query, browsing history, or
any other page content."

**Remote code / no remote code**
The extension does not execute remote code. All JavaScript ships inside the
package (Vite build output); the only network request the extension makes
is fetching its own bundled `data/sources.json` via
`chrome.runtime.getURL(...)`, which is a local extension resource — not a
network call. State this explicitly if the review flow asks about remote
hosted code, since Chrome flags this heavily.

---

# Visibility

For a first release, set **Visibility → Unlisted** in the dashboard. This
gives you a private install link you can share with the team without the
listing being searchable in the Chrome Web Store.
