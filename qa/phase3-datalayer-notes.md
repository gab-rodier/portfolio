# Phase 3: dataLayer notes

Branch `feat/datalayer-tracking` (2026-11-20). All tracking lives in `assets/tracking.js`, loaded in `<head>` right before the GTM snippet on all four pages. `tests/dl-check.mjs` (`npm run dl`) drives 61 interactions in headless Chromium and prints every push.

## How it behaves

- **One helper.** Every event goes through `push()`. It sends every parameter the spec lists for that event, and any missing value is `undefined` (never null, "", or "n/a").
- **initialize_dataLayer** fires once per page load, before GTM loads. The old `#samples` / `#skills` / `#write` links skip it on the homepage, so only the page they redirect to counts.
- **section_view** fires once per homepage section per load, after 1 second with at least 50% of the section on screen (or the section filling at least 50% of the screen, for sections taller than the screen). Scrolling past quickly does not count.
- **scroll** fires at 25, 50, 75, 90 and 100% the first time each is reached. `page_percentage` is a number.
- **Overlaps.** The specific event always fires (`external_link_click`, `file_download`, `click_to_email`, `modal_open`). Then exactly one location event fires: `main_nav_click` (header or phone menu), `footer_nav_click` (footer), or `cta_click` (buttons in the page).
- **No PII.**
  - Form fields are never read. The only form value sent is the Reason dropdown, which is a fixed list.
  - Search terms that look like an email, a phone number, or 6+ digits are sent as `*Omitted!* user PII suspected`.
  - Email-shaped text in `page_url` / `query_parameter` becomes `[email omitted]`.
  - Your address is always `gab.rodier address`.
- **internal_traffic.** `?internal=1` saves the flag in localStorage until a visit with `?internal=0`. It's sent as the string "true" or "false".
- **Debug.** `?dl_debug=1` logs each push to the console for the rest of the tab session. `?dl_debug=0` turns it off.
- **form_submit** fires only when the envelope reaches "thanks", which only happens after Formspree confirms. **failed_form_attempt** (approved in Phase 1) sends `element_type` "validation error", "server error", or "network error", and never the message text.
- **Replayed clicks.**
  - "Reset to Sample", "Clear All" and Skills "Reset filters" replay clicks on other controls. Only the button you pressed is counted.
  - A click in the Cycle step list replays a click on the ring. It's counted once.
  - Arrow keys that call a button's click are counted as `arrow key`, not as an arrow click.
- **info_hover.**
  - Fires after 1.5 seconds on the info icon (its popup is part of the same target) or on a Skills row.
  - Keyboard focus held for 1.5 seconds counts the same way.
  - On touch screens, each tap that opens the info counts once, right away.

## Values that follow the page instead of the sheet's example

The sheet's examples differ slightly from the live text in a few places. The push uses what's on the page, so reports match what visitors saw:

| Parameter | Sheet example | Pushed |
|---|---|---|
| modal_open click_text (tools) | Open The Tool | Open the Tool |
| footer_nav_click / click_to_email click_text | Email Me | Email me |
| expandable_content_click element_location (cycle) | The Cycle of UX Data | The Cycle of Data to UX |
| tool_interaction element_name (scoping group) | Data Quality | Data quality |
| modal_open element_name (case studies) | e.g. Department Turnaround and Growth Case Study | card title + " Case Study" for all six |

## Calls I made where the sheet is open

- **Extras you approved**, sent as `expandable_content_click`:
  - sector pills, location "Range of Experience"
  - Skills group toggles on phones, location "Skills + Tools"
  - Leadership tap-to-open cards on phones, location "Leadership section"

  These fire only when content opens, not when it closes or when the item is already open.
- **Dashboard pills:** `filter_interaction` with `element_name` set to the pill group ("PESO channel groups") and `filter_selection` like "Paid (off)" / "Paid (on)", since each pill toggles.
- **Skills reset:** `filter_interaction` with `element_name` "Reset", `element_type` "reset button", and the counts after the reset.
- **Skills search:** `element_name` is "Search Term" (from the parameter list). `secondary_filter_applied` joins Area and Level when both are set, e.g. "Area: Analytics, UX + CRO, Level: Expert".
- **Phone menu:**
  - The Menu button sends `hamburger_nav_open` plus `main_nav_click` (button, static).
  - The menu's links send `main_nav_click` (link, hamburger).
  - The close button sends `main_nav_click` (button, hamburger).
- **Footer Copy:** `copy_link_click` only. It isn't navigation, so it has no `footer_nav_click`.
- **CTA locations:**
  - Footer buttons count as footer navigation.
  - `cta_click` covers page buttons: "Homepage hero", "Analytics section", "AI section", "Operations section", "About section", "Work Samples page", "Skills + Tools page", "Contact page", "Maturity Framework case study", "Scoping System case study".
- **"Try the Self-Assessment" / "Try the Estimator"** also send `modal_open` for the tool when it was closed.
- **query_parameter** has no leading "?" and leaves out `internal` and `dl_debug`. **page_url** is the full URL, including the hash.
- **form_view click_text** is the seal text: "Open", or "Sent" when reopening after a send.

## Results

61 scenarios at desktop (1440) and phone (iPhone 13), with no page errors. Every event in the sheet fired with the expected values, including the negative cases:
- a section passed in under 1 second
- a hover under 1.5 seconds
- an empty search
- clicking a tab or step that is already showing

Phase 4 turns this into the formal QA file.
