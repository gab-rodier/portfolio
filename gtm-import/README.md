# GTM + GA4 setup

`portfolio-container.json` is the GTM import for the dataLayer in `assets/tracking.js`. It's generated, so don't edit it by hand:

- `node tests/tools/build-gtm.mjs` rebuilds it from the event list in `tracking.js`.
- `node tests/gtm-check.mjs` checks it before you import.

This folder is kept off the live site (see `_config.yml`).

## What's in the container

All of it is in the folder **Portfolio GA4 (import)**.

| Item | Count | Notes |
|---|---|---|
| Data Layer Variables (`DLV - <parameter>`) | 27 | One per parameter in the spec. Version 2, with no default value, so a pushed `undefined` stays undefined and GA4 drops that parameter instead of storing a fake value. |
| Custom Event triggers (`CE - <event>`) | 22 | One per dataLayer event, exact match. |
| GA4 event tags (`GA4 - <event>`) | 22 | Each maps exactly the parameters its event pushes, plus `traffic_type`. `initialize_dataLayer` is sent to GA4 as `page_view`, as the sheet says. Every other event keeps its dataLayer name. |
| Google tag (`Google tag - GA4`) | 1 | Reads the measurement ID from `Const - GA4 Measurement ID`. It fires once per page, on `initialize_dataLayer`. The automatic page_view is off (`send_page_view` false), because `GA4 - page_view` sends it with the spec's parameters. It also sets `page_title` from the dataLayer, so every event reports the spec's page titles. Every event tag uses it as its setup tag, so it always loads first. |
| `JS - GPC enabled` | 1 | `navigator.globalPrivacyControl === true`. |
| `Block - GPC enabled` | 1 | A blocking trigger on all 23 tags, Google tag included. When the browser sends GPC, nothing goes to GA4. |
| `Lookup - traffic_type` | 1 | Turns `internal_traffic` "true" into `traffic_type` "internal" on every event. For other visitors it's undefined, so the parameter isn't sent. |

## Import steps

1. In GTM, open the container `GTM-TWB3PMJN`, then go to **Admin > Import Container**.
2. Choose `gtm-import/portfolio-container.json`.
3. Under Workspace, choose **New** and name it something like "GA4 import".
4. Under Import option, choose **Merge**, then **Rename conflicting tags, triggers, and variables**.
5. Check the preview counts (23 tags, 23 triggers, 30 variables, plus the built-in Event variable), then click **Confirm**.
6. Open the variable **Const - GA4 Measurement ID** and replace `REPLACE_WITH_GA4_MEASUREMENT_ID` with your web stream's measurement ID. To find it in GA4, go to Admin > Data streams > your stream. It starts with `G-`.
7. If the container already had its own GA4 Google tag or GA4 event tags, pause or delete them so nothing is sent twice.
8. Click **Preview** and open the site with `?internal=1` on the end of the URL (this also marks your browser as internal). In Tag Assistant, check the following:
   - `GA4 - page_view` fires on `initialize_dataLayer`.
   - The `traffic_type` parameter reads "internal".
   - A click or two send their events.
9. Click **Submit** to publish.

## GA4 custom dimensions to register

Go to GA4 **Admin > Custom definitions > Create custom dimension**. All of these are **Event** scope. Use the parameter name exactly as shown.

That's 27 dimensions. Your sheet says the property has 23 event-scoped slots left after these.

| Dimension name | Scope | Event parameter | Sent on |
|---|---|---|---|
| Action | Event | `action` | content_slider_interaction |
| Click Direction | Event | `click_direction` | content_slider_interaction |
| Click Domain | Event | `click_domain` | external_link_click |
| Click Text | Event | `click_text` | 13 events |
| Click URL | Event | `click_url` | external_link_click, main_nav_click, footer_nav_click, file_download |
| Element ID | Event | `element_id` | form_view, form_submit, failed_form_attempt |
| Element Location | Event | `element_location` | 11 events |
| Element Name | Event | `element_name` | 9 events |
| Element Type | Event | `element_type` | 8 events |
| File Extension | Event | `file_extension` | file_download |
| File Name | Event | `file_name` | file_download |
| Filter Selection | Event | `filter_selection` | filter_interaction |
| Form Selection | Event | `form_selection` | form_submit |
| From State | Event | `from_state` | content_slider_interaction |
| Internal Traffic | Event | `internal_traffic` | page_view |
| Page Percentage | Event | `page_percentage` | scroll, back_to_top_click |
| Page Section Path | Event | `page_section_path` | page_view, section_view |
| Page Section Title | Event | `page_section_title` | page_view, section_view |
| Page Title | Event | `page_title` | page_view, section_view |
| Page Type | Event | `page_type` | page_view, section_view |
| Page URL | Event | `page_url` | page_view, section_view |
| Query Parameter | Event | `query_parameter` | page_view, section_view |
| Results Count | Event | `results_count` | filter_interaction |
| Search Filter Applied | Event | `search_filter_applied` | filter_interaction |
| Secondary Filter Applied | Event | `secondary_filter_applied` | filter_interaction |
| To State | Event | `to_state` | content_slider_interaction |
| Total Options | Event | `total_options` | content_slider_interaction, filter_interaction |

Notes:

- **File Extension, File Name and Page Title:** GA4 already has built-in dimensions that read these same parameters ("File extension", "File name", "Page title"). The custom versions would hold the same values. If GA4 rejects one as a duplicate name or parameter, skip it: the built-in one already reports it.
- **Internal Traffic** is only sent on page_view. To filter internal visits out of every event, use the data filter below, which relies on `traffic_type`.
- **When reports fill in:** custom dimensions only fill in from the moment they're registered, and new values can take 24 to 48 hours to show up in reports. DebugView shows them right away.

## Enhanced Measurement: what to turn off

Go to GA4 **Admin > Data streams > your web stream > Enhanced measurement**, then click the gear icon.

The dataLayer already tracks all of these, and three of them use the **same event names** as the site's own events. If they're left on, GA4 counts those three events twice.

| Toggle | Set to | Why |
|---|---|---|
| Page views | **On**, but open **Show advanced settings** and turn **off** "Page changes based on browser history events" | The page load is already sent once, by `GA4 - page_view`. The history option would send extra page_views when the homepage's `#ai` / `#operations` links change the URL hash. |
| Scrolls | **Off** | It sends its own `scroll` event at 90%. That would double-count the site's `scroll` event, which fires at 25 / 50 / 75 / 90 / 100. |
| Outbound clicks | **Off** | `external_link_click` covers these. |
| Site search | **Off** | Skills search is tracked as `filter_interaction`. Site search would also misread query parameters as searches. |
| Form interactions | **Off** | It sends its own `form_submit` and `form_start`. Its `form_submit` would double-count the site's `form_submit`, which only fires after Formspree confirms. |
| Video engagement | **Off** | The site has no embedded YouTube video, so there's nothing for it to measure. |
| File downloads | **Off** | It sends its own `file_download`, which would double-count the site's `file_download` event for the resume. |

## Internal traffic filter

The site sets `traffic_type` = "internal" on every event from a browser that visited with `?internal=1`. The flag lasts until a visit with `?internal=0`.

1. In GA4, go to **Admin > Data filters**. GA4 creates an "Internal Traffic" filter (`traffic_type` = internal) in the **Testing** state.
2. Check it in reports with the "Test data filter name" dimension.
3. Switch it to **Active**. Active filters drop matching events for good, so test it first.

You don't need an IP rule under "Define internal traffic", because the site sets the parameter itself.
