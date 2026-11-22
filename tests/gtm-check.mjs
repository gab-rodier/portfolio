// Checks gtm-import/portfolio-container.json against assets/tracking.js before it is imported:
// it is current, every {{variable}}, trigger ID and setup tag it references exists, names and IDs
// are unique, every event has one trigger and one GA4 tag mapping exactly its parameters, and every
// tag has the GPC blocking trigger. Usage: node tests/gtm-check.mjs
import fs from 'node:fs';
import { EVENTS, GA4_NAME, params, container } from './tools/build-gtm.mjs';

const file = JSON.parse(fs.readFileSync(new URL('../gtm-import/portfolio-container.json', import.meta.url), 'utf8'));
const c = file.containerVersion;
const errors = [];
const fail = m => errors.push(m);

if (JSON.stringify(file) !== JSON.stringify(container)) fail('container JSON is stale: run node tests/tools/build-gtm.mjs');

const BUILT_IN = new Set(c.builtInVariable.map(v => v.name === 'Event' ? '_event' : v.name));
const varNames = new Set(c.variable.map(v => v.name));
const triggerIds = new Set(c.trigger.map(t => t.triggerId));
const tagNames = new Set(c.tag.map(t => t.name));

const dupes = (list, what) => {
  const seen = new Set();
  list.forEach(x => { if (seen.has(x)) fail(`duplicate ${what}: ${x}`); seen.add(x); });
};
dupes(c.variable.map(v => v.name), 'variable name');
dupes(c.trigger.map(t => t.name), 'trigger name');
dupes(c.tag.map(t => t.name), 'tag name');
dupes([...c.variable.map(v => v.variableId), ...c.trigger.map(t => t.triggerId), ...c.tag.map(t => t.tagId)], 'ID');

// Every {{reference}} anywhere in the container resolves.
const text = JSON.stringify(c);
for (const [, ref] of text.matchAll(/\{\{([^}]+)\}\}/g)) {
  if (!varNames.has(ref) && !BUILT_IN.has(ref)) fail(`unknown variable {{${ref}}}`);
}

const blockId = c.trigger.find(t => t.name === 'Block - GPC enabled')?.triggerId;
if (!blockId) fail('missing GPC blocking trigger');
const gpc = c.variable.find(v => v.name === 'JS - GPC enabled');
if (!gpc || !gpc.parameter[0].value.includes('navigator.globalPrivacyControl === true')) fail('GPC variable missing or wrong');

for (const t of c.tag) {
  (t.firingTriggerId || []).forEach(id => triggerIds.has(id) || fail(`${t.name}: unknown firing trigger ${id}`));
  (t.blockingTriggerId || []).forEach(id => triggerIds.has(id) || fail(`${t.name}: unknown blocking trigger ${id}`));
  if (!(t.blockingTriggerId || []).includes(blockId)) fail(`${t.name}: no GPC blocking trigger`);
  (t.setupTag || []).forEach(s => tagNames.has(s.tagName) || fail(`${t.name}: unknown setup tag ${s.tagName}`));
}

// The Google tag reads the measurement ID from the constant, and the constant is a placeholder.
const gtag = c.tag.find(t => t.type === 'googtag');
const mid = c.variable.find(v => v.name === 'Const - GA4 Measurement ID');
if (!gtag || gtag.parameter.find(p => p.key === 'tagId')?.value !== '{{Const - GA4 Measurement ID}}') fail('Google tag does not read the measurement ID constant');
if (!mid || /^G-[A-Z0-9]{6,}$/.test(mid.parameter[0].value)) fail('measurement ID constant must stay a placeholder in the repo');

// One trigger and one GA4 tag per event, mapping exactly that event's parameters.
const rows = (t, key) => (t.parameter.find(p => p.key === key)?.list || []).map(m => Object.fromEntries(m.map.map(x => [x.key, x.value])));
for (const [ev, keys] of Object.entries(EVENTS)) {
  const trig = c.trigger.filter(t => t.type === 'CUSTOM_EVENT' && t.customEventFilter?.[0]?.parameter?.[1]?.value === ev && t.customEventFilter[0].type === 'EQUALS');
  if (trig.length !== 1) { fail(`${ev}: expected 1 trigger, found ${trig.length}`); continue; }
  const name = GA4_NAME[ev] || ev;
  const tag = c.tag.filter(t => t.type === 'gaawe' && t.parameter.find(p => p.key === 'eventName')?.value === name);
  if (tag.length !== 1) { fail(`${ev}: expected 1 GA4 tag, found ${tag.length}`); continue; }
  const t = tag[0];
  if (!t.firingTriggerId.includes(trig[0].triggerId)) fail(`${name}: tag does not fire on CE - ${ev}`);
  const mapped = rows(t, 'eventSettingsTable');
  const want = [...keys, 'traffic_type'];
  const got = mapped.map(r => r.parameter);
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`${name}: maps [${got}] but expected [${want}]`);
  mapped.filter(r => r.parameter !== 'traffic_type').forEach(r => {
    if (r.parameterValue !== `{{DLV - ${r.parameter}}}`) fail(`${name}: ${r.parameter} maps to ${r.parameterValue}`);
  });
  if (name.length > 40) fail(`${name}: GA4 event names are limited to 40 characters`);
}

// Every parameter has a Data Layer Variable (version 2, no default value).
for (const p of params) {
  const v = c.variable.find(x => x.name === `DLV - ${p}`);
  if (!v) { fail(`missing DLV - ${p}`); continue; }
  const get = k => v.parameter.find(x => x.key === k)?.value;
  if (v.type !== 'v' || get('name') !== p || get('dataLayerVersion') !== '2' || get('setDefaultValue') !== 'false') fail(`DLV - ${p} is misconfigured`);
}

const gtagRows = rows(gtag, 'configSettingsTable');
if (gtagRows.find(r => r.parameter === 'send_page_view')?.parameterValue !== 'false') fail('Google tag must turn off the automatic page_view');
if (!gtagRows.find(r => r.parameter === 'traffic_type')) fail('Google tag must set traffic_type');

console.log(`${Object.keys(EVENTS).length} events, ${params.length} parameters, ${c.tag.length} tags, ${c.trigger.length} triggers, ${c.variable.length} variables`);
if (errors.length) { console.log(errors.map(e => '  FAIL ' + e).join('\n')); process.exit(1); }
console.log('container OK');
