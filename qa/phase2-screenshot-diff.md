# Phase 2: screenshot and computed-style diff

Branch `refactor/split-assets-same-look` compared with `main` (2026-11-20).

## How it was checked

- `tests/shots.mjs` took 282 screenshots of `main` before any change: all four pages at 390 (iPhone 13 viewport, rendered at 1x), 768, 1024, and 1440 px, plus the open states. Those states are the 6 case popups, the 5 work sample dialogs, deck slide 2, each dashboard and tracking-doc tab, the dashboard filters, the maturity tool (open, dropdown, result), the estimator (open, changed), the 4 cycle steps, the quote carousel, the 3 AI-hours popups, the 5 sector pills, the 3 toolkit folders, the 4 books, the deliverable CTA hover, the leadership tap and phone menu, back to top, the legacy `#skills` redirect, Skills search, area, level, empty, reset, and tooltip, and the contact envelope open, errors, reason list, thanks, sealed, and copy email.
- The same script ran on this branch, and `tests/diff.mjs` compared the two sets pixel by pixel (pixelmatch, threshold 0.1).
- `tests/styles.mjs` compared the computed styles of every element and pseudo-element (70 properties) on all four pages at all four widths.
- Noise check: the differing states were shot again from an untouched `main` checkout and compared with the first `main` run.

## Results

**Computed styles: no differences.** The only changes were:
- elements that no longer exist on a page (the dialogs that page can't open)
- the contact Reason dropdown's label id, which changed from the invalid `-cv` to `csel-1-cv` (fix)

**Screenshots: 279 compared, 252 identical, 27 different.** (282 baseline shots minus 3 phone-only states the script skips at wider widths.)

| Difference | Shots | Verdict |
|---|---|---|
| Estimator after "Clear All" now shows 0 hours instead of a stale 110–190 | `home-estimator-changed` at all 4 widths | **Intended**: the estimator bug fix |
| 8 to 2,708 px (at most 0.067% of the image), scattered single-glyph anti-aliasing with no layout movement | 23 shots | **Rendering noise**: `main` compared with itself shows the same pattern; e.g. `contact-sealed` 104 px, `ws-dash-filtered` 103 px, `skills-reset` 2,708 px are identical counts in both comparisons |

No layout, color, spacing, or font changes were found.

## Behavior checked by hand (in the browser)

- Legacy hash redirects (`#samples`, `#skills`, `#write`) still go to the new pages.
- `aria-current` is correct on the nav for each page.
- The Formspree form validates, shows errors, and reaches thanks and then sealed (mocked success). The `_gotcha` trap is unchanged.
- The copy email button and the blur on hover still work.
- Skills: filters, search, group toggles, and "Reset filters" (which clears everything and returns focus to search) all work.
- Dashboard filters and tabs, deck arrows, dots, and reset on close all work.
- Estimator: ticking a task now recalculates (110–190 becomes 115–200, the same as the mockup), Clear All gives 0, and Reset to Sample gives 110–190.
