Paste everything below the line as your first message in the new Claude Code session.

---

You're picking up my portfolio site: a static GitHub Pages site with four real pages. Read CLAUDE.md first; its rules are hard rules. I want three things from you: a fresh review, clean production code with no visual changes, and the dataLayer events in reference/tracking-specs.csv firing correctly. Work in the phases below. Stop at the end of each phase and wait for my go-ahead. Ask me questions with multiple-choice options whenever a decision is mine to make.

## Phase 1: Review (report only, change nothing)
Read the site files, reference/mockup-d.html, and reference/tracking-specs.csv. Give me one short report, ranked by impact:
- bugs, accessibility issues (keyboard use, focus, contrast, reduced motion), performance (page weight, image sizes, render-blocking files), SEO/meta, and anything broken on phones
- a refactor plan: how you'll split assets/site.js (it's machine-generated, and every statement is wrapped in try/catch) and assets/site.css (one large file with many override blocks) into readable files, with no build step unless you can justify one
- problems in the tracking spec: mismatched names, unclear fire rules, PII risk, wrong data types, events that would double-count
- the exact list of elements each event will attach to (selector, page, and example values), so I can check it against the spec

## Phase 2: Refactor, same look
- First, take baseline screenshots with Playwright: every page at 390px (iPhone 13), 768, 1024, and 1440 widths, with the main interactive states open (case popups, work sample dialogs, the maturity tool, the estimator, the bookshelf, the quote carousel, the cycle steps, Skills search and filters, the contact envelope and form).
- Refactor, then re-take the screenshots and diff them. Any visible difference is a bug unless I approve it.
- Keep all behavior: legacy hash redirects, nav aria-current, the Formspree form, the copy-email blur, skills reset, and so on.
- Give me one pull request with a short summary and the screenshot diff results.

## Phase 3: dataLayer
- reference/tracking-specs.csv is the contract. Its "Dev Requirements (DL Specs)" column gives the exact event names, parameter names, data types, and fire rules (including the 2,000ms search wait). reference/parameter-list.csv lists every parameter. Where the sheet and this prompt disagree, ask me.
- Known sheet slip: the Section View row's code shows `event: 'initialize_dataLayer'`. Use `event: 'section_view'`.
- Put all tracking code in assets/tracking.js: one push helper and delegated listeners. Push `initialize_dataLayer` before the GTM snippet on every page.
- Fill these gaps the sheet leaves open:
  1. section_view fires once per homepage section per page load, after the section is at least 50% visible for 1 second. page_view (initialize_dataLayer) fires once per page load only.
  2. info_hover: fires each time a new hover lasts 1,500ms (as the sheet says). The trigger icon plus its open popup count as one hover target, so moving the pointer from the icon into the popup doesn't start a new hover. On touch screens, each tap that opens the info counts as one hover.
  3. filter_interaction search: if the term looks like an email address, a phone number, or a long string of digits, send exactly `*Omitted!* user PII suspected`. Ignore empty terms.
  4. My email address never goes into a push. Use "gab.rodier address" wherever the sheet says to (click_to_email click_text, footer_nav_click click_url, copy_link_click element_name).
  5. form_submit fires only after Formspree confirms success. Never send form field values (name, email, company, message). Add failed_form_attempt only if I approve it in Phase 1.
  6. internal_traffic: the sheet says "rest of the session", but I've since decided it should persist. `?internal=1` (or `&internal=1`) stores the flag in localStorage on that browser until a visit with `?internal=0`. Push it as the string "true" or "false" on initialize_dataLayer, wrapping storage access in try/catch. In the GTM import, also set GA4's built-in `traffic_type` to "internal" on every event when internal_traffic is "true", so GA4's Internal traffic data filter works too.
  7. Debug: `?dl_debug=1` logs every push to the console.

## Phase 4: GTM container + QA
- Write a GTM container JSON (gtm-import/portfolio-container.json) that I can import into a new workspace using Merge. It should include:
  - data layer variables for every parameter
  - a custom event trigger per event
  - one GA4 event tag per event that maps its parameters
  - a Google tag (read the GA4 measurement ID from a constant variable I fill in; leave a clear placeholder and never invent one)
  - the GPC variable `navigator.globalPrivacyControl === true` with blocking triggers on every GA4 tag
- Also give me:
  - the list of GA4 custom dimensions to register (name, scope, parameter)
  - the GA4 Enhanced Measurement toggles to turn off so nothing double-counts
- QA: use Playwright to fire every event, assert each push matches the spec (names, types, undefined handling), and save the results as qa/dataLayer-qa.md in the same columns as my tracking sheet's QA notes.
