// Builds gtm-import/portfolio-container.json from the event list in assets/tracking.js, so the
// GTM container always matches what the site pushes. Usage: node tests/tools/build-gtm.mjs
//
// What the container holds:
// - one Data Layer Variable per parameter (version 2, no default, so undefined stays undefined)
// - one Custom Event trigger per dataLayer event
// - one GA4 event tag per event, mapping exactly the parameters that event pushes, plus traffic_type
// - a Google tag that reads the measurement ID from a constant (placeholder, filled in by hand)
// - a GPC variable and a blocking trigger on every tag
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = fs.readFileSync(path.join(root, 'assets/tracking.js'), 'utf8');

// Pull PAGE_KEYS, NAV_KEYS and EVENTS out of tracking.js and evaluate just those lines.
const grab = re => { const m = src.match(re); if (!m) throw new Error('not found in tracking.js: ' + re); return m[0]; };
const block = [
  grab(/var PAGE_KEYS = \[[^\]]*\];/),
  grab(/var NAV_KEYS = \[[^\]]*\];/),
  grab(/var EVENTS = \{[\s\S]*?\n  \};/),
].join('\n');
const EVENTS = new Function(block + '\nreturn EVENTS;')();

// The sheet's GA4 event names. Only the page load differs from its dataLayer name.
const GA4_NAME = { initialize_dataLayer: 'page_view' };

export const PLACEHOLDER_ID = 'REPLACE_WITH_GA4_MEASUREMENT_ID';
// The real container ID from the page head (the import ignores it, but it labels the file).
const PUBLIC_ID = (fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/GTM-[A-Z0-9]+/) || ['GTM-UNKNOWN'])[0];
const ACC = '0', CON = '0';
const FOLDER_ID = '1';

const params = [...new Set(Object.values(EVENTS).flat())].sort();
let nextId = 10;
const id = () => String(nextId++);
const base = () => ({ accountId: ACC, containerId: CON });
const tpl = (key, value) => ({ type: 'TEMPLATE', key, value });
const kv = (a, b, k1 = 'parameter', k2 = 'parameterValue') => ({ type: 'MAP', map: [tpl(k1, a), tpl(k2, b)] });

// ---------- variables ----------
const dlvName = p => `DLV - ${p}`;
const variables = params.map(p => ({
  ...base(), variableId: id(), name: dlvName(p), type: 'v', parentFolderId: FOLDER_ID,
  parameter: [
    { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
    { type: 'BOOLEAN', key: 'setDefaultValue', value: 'false' },
    tpl('name', p),
  ],
}));
const MID = 'Const - GA4 Measurement ID';
const GPC = 'JS - GPC enabled';
const TT = 'Lookup - traffic_type';
variables.push(
  { ...base(), variableId: id(), name: MID, type: 'c', parentFolderId: FOLDER_ID,
    notes: 'Replace the value with the GA4 web stream measurement ID (Admin > Data streams). Starts with G-.',
    parameter: [tpl('value', PLACEHOLDER_ID)] },
  { ...base(), variableId: id(), name: GPC, type: 'jsm', parentFolderId: FOLDER_ID,
    notes: 'true when the browser sends Global Privacy Control. Every tag is blocked when it is true.',
    parameter: [tpl('javascript', 'function() {\n  return navigator.globalPrivacyControl === true;\n}')] },
  { ...base(), variableId: id(), name: TT, type: 'smm', parentFolderId: FOLDER_ID,
    notes: 'internal_traffic "true" becomes traffic_type "internal" (for the GA4 Internal traffic data filter). Anything else stays undefined, so the parameter is not sent.',
    parameter: [
      { type: 'BOOLEAN', key: 'setDefaultValue', value: 'false' },
      tpl('input', `{{${dlvName('internal_traffic')}}}`),
      { type: 'LIST', key: 'map', list: [kv('true', 'internal', 'key', 'value')] },
    ] },
);

// ---------- triggers ----------
const triggers = [];
const ceTrigger = {};
for (const ev of Object.keys(EVENTS)) {
  const t = { ...base(), triggerId: id(), name: `CE - ${ev}`, type: 'CUSTOM_EVENT', parentFolderId: FOLDER_ID,
    customEventFilter: [{ type: 'EQUALS', parameter: [tpl('arg0', '{{_event}}'), tpl('arg1', ev)] }] };
  triggers.push(t);
  ceTrigger[ev] = t.triggerId;
}
const block_ = { ...base(), triggerId: id(), name: 'Block - GPC enabled', type: 'CUSTOM_EVENT', parentFolderId: FOLDER_ID,
  notes: 'Blocking trigger on every tag: matches any event while the browser sends Global Privacy Control.',
  customEventFilter: [{ type: 'MATCH_REGEX', parameter: [tpl('arg0', '{{_event}}'), tpl('arg1', '.*')] }],
  filter: [{ type: 'EQUALS', parameter: [tpl('arg0', `{{${GPC}}}`), tpl('arg1', 'true')] }] };
triggers.push(block_);

// ---------- tags ----------
const GTAG = 'Google tag - GA4';
const tags = [{
  ...base(), tagId: id(), name: GTAG, type: 'googtag', parentFolderId: FOLDER_ID,
  notes: 'Fires once per page on initialize_dataLayer (the first push on every page), so the page values are already in the data layer. Automatic page_view is off: the GA4 - page_view tag sends it with the spec parameters.',
  parameter: [
    tpl('tagId', `{{${MID}}}`),
    { type: 'LIST', key: 'configSettingsTable', list: [
      kv('send_page_view', 'false'),
      kv('page_title', `{{${dlvName('page_title')}}}`),
      kv('traffic_type', `{{${TT}}}`),
    ] },
  ],
  firingTriggerId: [ceTrigger.initialize_dataLayer],
  blockingTriggerId: [block_.triggerId],
  tagFiringOption: 'ONCE_PER_LOAD',
  monitoringMetadata: { type: 'MAP' },
  consentSettings: { consentStatus: 'NOT_SET' },
}];
for (const [ev, keys] of Object.entries(EVENTS)) {
  const name = GA4_NAME[ev] || ev;
  tags.push({
    ...base(), tagId: id(), name: `GA4 - ${name}`, type: 'gaawe', parentFolderId: FOLDER_ID,
    parameter: [
      { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' },
      tpl('eventName', name),
      tpl('measurementIdOverride', `{{${MID}}}`),
      { type: 'LIST', key: 'eventSettingsTable', list: [
        ...keys.map(k => kv(k, `{{${dlvName(k)}}}`)),
        kv('traffic_type', `{{${TT}}}`),
      ] },
    ],
    firingTriggerId: [ceTrigger[ev]],
    blockingTriggerId: [block_.triggerId],
    setupTag: [{ tagName: GTAG, stopOnSetupFailure: false }],
    tagFiringOption: 'ONCE_PER_EVENT',
    monitoringMetadata: { type: 'MAP' },
    consentSettings: { consentStatus: 'NOT_SET' },
  });
}

const container = {
  exportFormatVersion: 2,
  exportTime: '2026-11-22 00:00:00',
  containerVersion: {
    path: `accounts/${ACC}/containers/${CON}/versions/0`,
    accountId: ACC, containerId: CON, containerVersionId: '0',
    container: { path: `accounts/${ACC}/containers/${CON}`, accountId: ACC, containerId: CON,
      name: 'Portfolio', publicId: PUBLIC_ID, usageContext: ['WEB'] },
    folder: [{ ...base(), folderId: FOLDER_ID, name: 'Portfolio GA4 (import)' }],
    tag: tags,
    trigger: triggers,
    variable: variables,
    builtInVariable: [{ ...base(), type: 'EVENT', name: 'Event' }],
  },
};

export { EVENTS, GA4_NAME, params, container };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const out = path.join(root, 'gtm-import/portfolio-container.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(container, null, 2) + '\n');
  console.log(`wrote ${path.relative(root, out)}: ${tags.length} tags, ${triggers.length} triggers, ${variables.length} variables (${params.length} data layer variables)`);
}
