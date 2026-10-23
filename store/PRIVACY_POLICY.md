# Privacy policy — Source Reliability Plugin (DE.CO.DE)

Last updated: 2026-10-23

Published at: https://bureau1217.github.io/decode_sourceplugin/
(source: `docs/index.html` — keep both in sync)

## What this extension does

Source Reliability Plugin ("the extension") displays a trust score next to
sources in Google search results, using a bundled reliability database, and
lets you record whether you agree or disagree with a given score.

## Data the extension reads

The extension reads the DOM of google.com search results pages (result
titles and links) in order to match each result's domain against its
reliability database. It does not read your search query text, your
browsing history on other sites, or the content of the pages you visit
beyond google.com search result listings.

## Data the extension stores

- Whether badges are enabled (`chrome.storage.local`)
- Your local agree/disagree votes, keyed by domain (`chrome.storage.local`)
- Sources you suggest via "Rate this source" (`chrome.storage.local`)

This data is stored locally in your browser only. It is not transmitted to
any server, and the extension has no backend as of this version.

## Data the extension shares

None. No analytics, no third-party requests, no remote code execution.

## Changes

If a future version connects to a content management system (planned, not
yet built) to keep the reliability database up to date, this policy will
be updated to describe what that service receives before that version
ships.

## Contact

opal.remi@gmail.com
