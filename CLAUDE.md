# Gabrielle Rodier Portfolio: rules for this repo

Live site: https://gab-rodier.github.io/portfolio/ (GitHub Pages, static, no build server)

## Hard rules (never break)
- No client names, logos, or identifying details anywhere: code, comments, copy, commit messages, test fixtures, or dataLayer values. Former employers (Happy Cog, Merkle, Seer) may appear in copy, but must never be tied to KPI numbers. The dashboard "Larkspur" names and hostnames are placeholders that already exist on the site. Don't add new ones.
- Never show hard target values for KPIs.
- No visitor PII in dataLayer pushes or GA4: never send form field values (name, email, company, message) or anything a visitor types that looks like PII. Never push email addresses, including Gabrielle's own: use "gab.rodier address" where the spec says to.
- The GTM container ID in the page head is real and intended. Don't add any other analytics IDs, pixels, or third-party scripts.
- No visual changes unless Gabrielle asks for them. Desktop and phone screenshots before and after any refactor must match.
- Copy style: no em dashes.
- Work on a branch, open a pull request, and never push to main.

## Structure
- `index.html` (home), `work-samples/`, `skills-tools/`, `contact/` are four real pages.
- `assets/css/*.css`: loaded in this order (the order is the cascade): base, header-hero, sections, dialogs, responsive, work-samples, widgets, type, phone. Later files intentionally override earlier ones.
- `assets/js/main.js` (ES module entry) imports `assets/js/features/*.js`; each feature checks for its own elements, so one entry serves all pages. No build step.
- `assets/img/` (images, favicon.svg, apple-touch-icon.png)
- Each page only includes the dialogs it opens: case studies (`cs-*`) on home, work samples (`ws-*`) on `work-samples/`.
- `tests/` (not deployed): `shots.mjs` (screenshots of every page and state at 390/768/1024/1440), `diff.mjs` (pixel diff), `styles.mjs` (computed-style diff). Run with Node; see `package.json`.
- `Gabrielle-Rodier-Resume.pdf` sits at the root.
- Old hash links (`#samples`, `#skills`, `#write`) on home redirect to the new pages, so keep that working.
- Contact form posts to Formspree via fetch, with the envelope animation and a `_gotcha` spam trap.
- `reference/mockup-d.html` is the frozen single-file design reference. It's not deployed; use it to compare behavior.

## Design tokens
forest #2f4a40, surface #f6f4ea, surface-deep #1f2a26, rose #d89684, rose-deep #8e4b50, sage #96ab88, tint-sage #dce6d3, tint-rose #f6ddd6, About background #F8E9E4.
Fonts: Figtree headings, Manrope body, Libre Caslon on the book covers.

## Tracking
- The spec is in `reference/tracking-specs.csv` and `reference/parameter-list.csv`, exported from Gabrielle's tracking sheet. The "Dev Requirements (DL Specs)" column is the exact dataLayer contract.
- Every parameter with no value is pushed as `undefined`, never null, "", or "n/a".
- Tracking code lives in one file (`assets/tracking.js`) with one small helper. Don't scatter pushes through the UI code.
- GTM honors Global Privacy Control in GTM itself. The site code doesn't need to check it.

## How work is organized
- reference/START-PROMPT.md holds the handoff plan in four phases. reference/STATUS.md is the running log.
- At the start of every session, read reference/STATUS.md to see what's done and what's next.
- At the end of every phase or task, add a dated line to STATUS.md: what changed, the PR link, and anything still open.
- Stop after each phase and wait for Gabrielle's go-ahead.
- For new work after the handoff (copy tweaks, new events), follow these rules: branch, PR, screenshots for anything visual, and the tracking spec for anything tracked.
