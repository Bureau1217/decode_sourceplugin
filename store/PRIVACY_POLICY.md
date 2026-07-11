# Privacy policy — Source Reliability Plugin (DE.CO.DE)

Last updated: 2026-07-11

The Chrome Web Store requires a publicly reachable URL for this text (it
cannot just live in the zip). Easiest options: paste this into a GitHub
Pages / Notion / Google Doc "publish to web" link, or a page on your own
site, then paste that URL into the "Privacy policy" field in the Developer
Dashboard.

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
