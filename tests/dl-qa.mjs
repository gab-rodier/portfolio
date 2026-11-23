// Formal dataLayer QA: runs every scenario in tests/dl-check.mjs, checks every push against the
// spec, and writes qa/dataLayer-qa.md in the tracking sheet's QA columns.
// Usage: node tests/dl-qa.mjs          (npm run qa)
//
// Checked on every push, in every scenario:
// - the event is one the spec defines (assets/tracking.js EVENTS mirrors the sheet)
// - it carries exactly the spec's parameters, each one present, missing ones as undefined
// - no null, "", "n/a" or NaN; page_percentage is a number, every other value is a string
// - no email address (anything with @) and none of the form values the test typed
// Checked per scenario: the pushes the spec calls for, with their values, in order, and that
// nothing fires where the spec says it shouldn't (short hovers, re-clicks, quick fly-bys).
import fs from 'node:fs';
import { runScenarios, SCENARIOS } from './dl-check.mjs';
import { EVENTS, GA4_NAME } from './tools/build-gtm.mjs';

const U = '(undefined)'; // how dl-check records a key that was pushed as undefined
const NUMBER_KEYS = new Set(['page_percentage']);
const TYPED = ['Test Person', 'test@example.com', 'Hello', 't@example.com', 'jane@example.com', '(215) 555-0100', '1234567890'];
const HOST = 'localhost:4174/portfolio/';
const RESUME = { file_name: 'Gabrielle-Rodier-Resume', file_extension: 'PDF', click_url: `http://${HOST}Gabrielle-Rodier-Resume.pdf` };
const page = (title, type, extra = {}) => ({ event: 'initialize_dataLayer', page_title: title, page_type: type, ...extra });
const home = (extra = {}) => page('Homepage', 'home', { query_parameter: U, page_section_path: U, page_section_title: U, internal_traffic: 'false', ...extra });
const sv = id => ({ event: 'section_view', page_title: 'Homepage', page_type: 'home', page_section_path: '#' + id, page_section_title: id });
const slide = (action, dir, loc, from, to, total) => ({ event: 'content_slider_interaction', action, click_direction: dir, element_location: loc, from_state: from, to_state: to, total_options: total });
const skills = (name, type, sel, results, extra = {}) => ({ event: 'filter_interaction', element_location: 'Skills + Tools', element_name: name, element_type: type, filter_selection: sel, results_count: results, total_options: '107', ...extra });
const dash = (name, sel, secondary = U) => ({ event: 'filter_interaction', element_location: 'Executive Dashboard work sample', element_name: name, element_type: 'selectable option', filter_selection: sel, results_count: U, total_options: U, secondary_filter_applied: secondary, search_filter_applied: U });
const tool = (loc, type, name, text) => ({ event: 'tool_interaction', element_type: type, element_location: loc, element_name: name, click_text: text });
const modal = (ev, name, type, text) => ({ event: ev, element_name: name, element_type: type, ...(text ? { click_text: text } : {}) });
const exp = (text, loc) => ({ event: 'expandable_content_click', click_text: text, element_location: loc });
const nav = (ev, text, url, type, loc) => ({ event: ev, click_text: text, click_url: url, element_type: type, element_location: loc });
const hover = (name, loc, type) => ({ event: 'info_hover', element_name: name, element_location: loc, element_type: type });
const FORM = { element_name: 'contact form', element_id: 'contact-form' };
const AI = 'AI - Hours Saved', SKL = 'Skills + Tools - Leadership + Operations';
const CYCLE = 'The Cycle of Data to UX', QDR = 'Quarterly Department Review work sample';

// has: pushes that must appear in this order (other pushes may sit between them; only the keys
//      listed are compared). count: exact number of pushes for an event (0 = must not fire).
const EXPECT = {
  'init home': { has: [home()], count: { initialize_dataLayer: 1 } },
  'init home #ai + query': { has: [home({ page_url: `http://${HOST}?utm_source=test&dl_debug=1#ai`, query_parameter: 'utm_source=test', page_section_path: '#ai', page_section_title: 'ai' })], logs: 1 },
  'init work samples': { has: [page('Work Samples', 'work samples', { page_url: `http://${HOST}work-samples/`, query_parameter: U, internal_traffic: 'false' })] },
  'init skills': { has: [page('Skills + Tools', 'skills + tools', { internal_traffic: 'false' })] },
  'init contact': { has: [page('Contact', 'contact', { internal_traffic: 'false' })] },
  'init internal=1 then plain': { has: [home({ internal_traffic: 'true' })], note: 'flag set by ?internal=1 persists on the next plain visit' },
  'init internal=0 clears': { has: [home({ internal_traffic: 'false' })], note: '?internal=0 clears the stored flag' },
  'legacy #skills redirect': { has: [page('Skills + Tools', 'skills + tools')], count: { initialize_dataLayer: 1 }, note: 'old #skills link redirects; only the destination page counts' },
  'init email in query': { has: [home({ page_url: `http://${HOST}?ref=[email omitted]`, query_parameter: 'ref=[email omitted]' })], note: 'email in the URL is replaced' },
  'scroll + section_view': {
    has: [25, 50, 75, 90, 100].map(n => ({ event: 'scroll', page_percentage: n })),
    also: ['analytics', 'ai', 'operations', 'leadership', 'about'].map(sv),
    count: { scroll: 5, section_view: 5 }, note: 'each depth and each section once',
  },
  'section flyby (<1s) no view': { count: { section_view: 0 }, note: 'section on screen under 1s: no section_view' },
  'main nav link': { has: [nav('main_nav_click', 'About', `${HOST}#about`, 'link', 'static')] },
  'main nav logo': { has: [nav('main_nav_click', 'logo icon', HOST, 'icon', 'static')] },
  'main nav Get in Touch btn': { has: [nav('main_nav_click', 'Get in Touch', `${HOST}contact/`, 'button', 'static')] },
  'hamburger open + link + close': {
    has: [{ event: 'hamburger_nav_open' }, nav('main_nav_click', 'Get in Touch', `${HOST}contact/`, 'button', 'hamburger'), { event: 'hamburger_nav_open' }],
    count: { hamburger_nav_open: 2, main_nav_click: 1 },
    note: 'opening the menu sends hamburger_nav_open only; the Close button sends nothing; only the menu link sends main_nav_click',
  },
  'hamburger logo': { has: [{ event: 'hamburger_nav_open' }, nav('main_nav_click', 'logo icon', HOST, 'icon', 'hamburger')], count: { main_nav_click: 1 } },
  'main nav AI + Skills + Tools links': { has: [nav('main_nav_click', 'AI', `${HOST}#ai`, 'link', 'static'), nav('main_nav_click', 'Skills + Tools', `${HOST}skills-tools/`, 'link', 'static')] },
  'footer email me': { has: [{ event: 'click_to_email', click_text: 'Email me', element_location: 'footer' }, nav('footer_nav_click', 'Email me', 'gab.rodier address', 'button', 'Get in Touch')] },
  'footer linkedin': { has: [{ event: 'external_link_click', click_text: 'LinkedIn', click_url: 'www.linkedin.com/in/gabrodier', click_domain: 'linkedin.com' }, nav('footer_nav_click', 'LinkedIn', 'www.linkedin.com/in/gabrodier', 'button', 'Get in Touch')] },
  'footer resume': { has: [{ event: 'file_download', ...RESUME, click_text: 'Resume (PDF)', element_location: 'footer' }, nav('footer_nav_click', 'Resume (PDF)', `${HOST}Gabrielle-Rodier-Resume.pdf`, 'button', 'Get in Touch')] },
  'footer explore': { has: [nav('footer_nav_click', 'AI', `${HOST}#ai`, 'link', 'Explore')] },
  'footer logo': { has: [nav('footer_nav_click', 'logo icon', HOST, 'icon', 'logo')] },
  'footer copy': { has: [{ event: 'copy_link_click', click_text: 'Copy', element_location: 'footer', element_name: 'gab.rodier address' }], count: { footer_nav_click: 0 } },
  'hero CTAs': { has: [
    { event: 'cta_click', click_text: 'Get in Touch', element_location: 'Homepage hero' },
    { event: 'external_link_click', click_text: 'Connect on LinkedIn', click_domain: 'linkedin.com' }, { event: 'cta_click', click_text: 'Connect on LinkedIn', element_location: 'Homepage hero' },
    { event: 'file_download', ...RESUME, click_text: 'Download Resume' }, { event: 'cta_click', click_text: 'Download Resume', element_location: 'Homepage hero' }] },
  'section CTAs': { has: [['See Deliverable Examples', 'Analytics section'], ['See deliverables optimized by AI efficiencies', 'AI section'], ['See Deliverable Examples', 'Operations section'], ['Explore All Skills + Tools', 'About section']].map(([t, l]) => ({ event: 'cta_click', click_text: t, element_location: l })) },
  'work samples CTAs': { has: [{ event: 'cta_click', click_text: 'Back to the Portfolio', element_location: 'Work Samples page' }, { event: 'cta_click', click_text: 'Get in Touch', element_location: 'Work Samples page' }, { event: 'file_download', ...RESUME }, { event: 'cta_click', click_text: 'Download Resume', element_location: 'Work Samples page' }] },
  'contact page links': { has: [{ event: 'click_to_email', click_text: 'gab.rodier address', element_location: 'contact page' }, { event: 'file_download', ...RESUME, click_text: 'Download the PDF', element_location: 'contact page' }, { event: 'cta_click', click_text: 'Back to the Portfolio', element_location: 'Contact page' }] },
  'back to top': { has: [{ event: 'back_to_top_click' }], count: { back_to_top_click: 1 }, check: ps => ps.filter(p => p.event === 'back_to_top_click').every(p => p.page_percentage >= 60 && p.page_percentage <= 80) || 'page_percentage should be about 70 (scrolled to 60% of the page)' },
  'case study open/close': { has: [modal('modal_open', 'Department Turnaround and Growth Case Study', 'Case Study', 'Read the case'), modal('modal_close', 'Department Turnaround and Growth Case Study', 'Case Study')] },
  'case study escape close': { has: [modal('modal_open', "One Customer Journey Across a Studio's Four-Site Debut Case Study", 'Case Study', 'Read the case'), modal('modal_close', "One Customer Journey Across a Studio's Four-Site Debut Case Study", 'Case Study')], note: 'Escape key closes' },
  'work sample open/close': { has: [modal('modal_open', 'Executive Dashboard Work Sample', 'Work Sample', 'Open the dashboard'), modal('modal_close', 'Executive Dashboard Work Sample', 'Work Sample')] },
  'try the self-assessment CTA': { has: [modal('modal_open', 'A Five-Phase Maturity Model for Web Analytics Case Study', 'Case Study'), { event: 'cta_click', click_text: 'Try the Self-Assessment', element_location: 'Maturity Framework case study' }, modal('modal_open', 'Maturity Framework Tool', 'Tool', 'Try the Self-Assessment')] },
  'maturity tool': { has: [modal('modal_open', 'Maturity Framework Tool', 'Tool', 'Open the Tool'), tool('Maturity Tool', 'dropdown selection', 'Strategic measurement', 'level 4'), tool('Maturity Tool', 'submit for result', U, 'See My Result'), modal('modal_close', 'Maturity Framework Tool', 'Tool')] },
  'maturity dropdown by keyboard': { has: [tool('Maturity Tool', 'dropdown selection', 'Data collection', 'level 3')], count: { tool_interaction: 1 } },
  'scoping tool': { has: [modal('modal_open', 'Scoping Tool', 'Tool', 'Open the Tool'), tool('Scoping Tool', 'checkbox selection', 'Tracking', 'checkbox section option 4'), tool('Scoping Tool', 'checkbox selection', 'Data quality', 'checkbox section option 2'),
    tool('Scoping Tool', 'multi-choice button selection', 'Overall business + digital complexity', 'High'), tool('Scoping Tool', 'selections wide-span update', U, 'Clear All'), tool('Scoping Tool', 'selections wide-span update', U, 'Reset to Sample')], count: { tool_interaction: 5 }, note: 'Clear All / Reset replay other clicks; only the button pressed counts' },
  'cycle steps + list + keys': { has: [exp('Test or Ship', CYCLE), exp('Find the Friction', CYCLE), exp('Recommend the Change', CYCLE)], count: { expandable_content_click: 3 }, note: 're-click on the open step sends nothing' },
  'cycle arrows (phone)': { has: [exp('Recommend the Change', CYCLE), exp('Find the Friction', CYCLE)], count: { expandable_content_click: 2 } },
  'sector pills': { has: [exp('Retail + Hospitality', 'Range of Experience')], count: { expandable_content_click: 1 }, note: 'second click on the open pill sends nothing' },
  'folders': { has: [exp('Analytics + UX', 'Toolkit Highlights')] },
  'bookshelf': { has: [exp('Volunteering', 'Off the Clock')] },
  'leadership tap (phone)': { has: [exp('Career Paths', 'Leadership section')], count: { expandable_content_click: 1 }, note: 'closing the card sends nothing' },
  'tracking doc tabs': { has: [modal('modal_open', 'Tracking Plan + Audit Excerpt Work Sample', 'Work Sample'), exp('Key events', 'Tracking Plan + Audit Excerpt work sample'), exp('QA status', 'Tracking Plan + Audit Excerpt work sample')] },
  'dashboard tabs': { has: [exp('Content', 'Executive Dashboard work sample')] },
  'quotes arrows + bar': { has: [slide('shift arrow click', 'forward', 'review feedback quotes', '1-2', '2-3', '4'), slide('shift arrow click', 'backward', 'review feedback quotes', '2-3', '1-2', '4'), slide('shift bar click', 'forward', 'review feedback quotes', '1-2', '3-4', '4')], count: { content_slider_interaction: 3 } },
  'case row arrows + dot': { has: [slide('shift arrow click', 'forward', 'Analytics case studies', '1', '2', '3'), slide('shift arrow click', 'backward', 'Analytics case studies', '2', '1', '3'), slide('shift bar click', 'forward', 'Analytics case studies', '1', '3', '3')], count: { content_slider_interaction: 3 }, note: 'disabled arrow at the end sends nothing' },
  'work sample card arrows': { has: [slide('shift arrow click', 'forward', 'work sample cards', '1', '2', '5')], count: { content_slider_interaction: 1 } },
  'quotes arrow key': { has: [slide('arrow key', 'forward', 'review feedback quotes', '1-2', '2-3', '4')], count: { content_slider_interaction: 1 } },
  'deck arrows + dots + keys': { has: [modal('modal_open', 'Quarterly Department Review Work Sample', 'Work Sample', 'View the excerpt'), slide('shift arrow click', 'forward', QDR, '1', '2', '4'), slide('shift bar click', 'forward', QDR, '2', '4', '4'), slide('arrow key', 'backward', QDR, '4', '3', '4'), slide('shift arrow click', 'backward', QDR, '3', '2', '4'), slide('shift arrow click', 'backward', QDR, '2', '1', '4')], count: { content_slider_interaction: 5 } },
  'skills chips': { has: [skills('Area', 'selectable option', 'Analytics, UX + CRO', '23', { secondary_filter_applied: U, search_filter_applied: U }), skills('Level', 'selectable option', 'Expert', '11', { secondary_filter_applied: 'Area: Analytics, UX + CRO', search_filter_applied: U })] },
  're-click same choices (no pushes)': { has: [skills('Level', 'selectable option', 'Expert', '24')], count: { filter_interaction: 1 }, note: 'only the first click changes anything; re-clicks and "All" while already all send nothing' },
  're-pick same dropdown/chip (no pushes)': { has: [tool('Maturity Tool', 'dropdown selection', 'Data collection', 'level 3')], count: { tool_interaction: 1 }, note: 're-picking the current dropdown value or chip sends nothing' },
  'dashboard same option (no push)': { count: { filter_interaction: 0 } },
  'skills search': { has: [skills('Level', 'selectable option', 'Expert', '24'), skills('Search Term', 'search bar', 'platform', '0', { secondary_filter_applied: 'Level: Expert' })], count: { filter_interaction: 2 }, note: 'search fires once, 2,000ms after typing stops ("platf" is never sent)' },
  'skills search PII': { has: [1, 2, 3].map(() => skills('Search Term', 'search bar', '*Omitted!* user PII suspected', '0')), count: { filter_interaction: 3 }, note: 'email, phone and digit run omitted; empty search ignored' },
  'skills reset': { has: [skills('Level', 'selectable option', 'Expert', '24'), skills('Reset', 'reset button', 'Reset filters', '1')], count: { filter_interaction: 2 } },
  'skills group toggle (phone)': { has: [exp('Leadership + Operations', 'Skills + Tools')], count: { expandable_content_click: 1 } },
  'dashboard filters': { has: [dash('Hostname', 'docs.larkspurlabs.com'), dash('Date range', 'Last 26 weeks', 'Hostname: docs.larkspurlabs.com'), exp('Acquisition', 'Executive Dashboard work sample'),
    dash('PESO channel groups', 'Paid (off)', 'Hostname: docs.larkspurlabs.com, Date range: Last 26 weeks'), dash('PESO channel groups', 'Paid (on)', 'Hostname: docs.larkspurlabs.com, Date range: Last 26 weeks')], note: 'secondary_filter_applied lists the other filters already set' },
  'AI info hover 1.6s': { has: [hover('5h Tracking Document Scaffolding', AI, 'Reinvested Into'), hover('5h Tracking Document Scaffolding', AI, 'Reinvested Into')], count: { info_hover: 2 }, note: 'each new 1.5s hover counts' },
  'AI info short hover': { count: { info_hover: 0 }, note: '0.8s hover: nothing' },
  'AI info click while hovering': { has: [hover('10–15h QA / Audit Checklists + Summaries', AI, 'Reinvested Into')], count: { info_hover: 1 }, note: 'click plus hover is one hover' },
  'AI info tap (phone)': { has: [hover('5h Tracking Document Scaffolding', AI, 'Reinvested Into'), hover('5h Tracking Document Scaffolding', AI, 'Reinvested Into')], count: { info_hover: 2 }, note: 'each tap that opens the info counts once' },
  'skills row hover': { has: [hover('Affiliate & Partnership Marketing', SKL, 'Level With Note'), hover('Analytics Function Design', SKL, 'Basic Level')], count: { info_hover: 2 } },
  'skills row keyboard focus': { has: [hover('Affiliate & Partnership Marketing', SKL, 'Level With Note')], count: { info_hover: 1 } },
  'skills row tap (phone)': { has: [hover('Affiliate & Partnership Marketing', SKL, 'Level With Note')], count: { info_hover: 1 } },
  'form view + validation error': { has: [{ event: 'form_view', ...FORM, click_text: 'Open' }, { event: 'failed_form_attempt', ...FORM, click_text: 'Send Note', element_type: 'validation error' }], count: { form_submit: 0 } },
  'form submit success': { has: [{ event: 'form_view', ...FORM, click_text: 'Open' }, { event: 'form_submit', ...FORM, click_text: 'Send Note', form_selection: 'Reason: Just saying hi' }], count: { form_submit: 1, failed_form_attempt: 0 }, note: 'Formspree success mocked; typed values never pushed' },
  'form server error': { has: [{ event: 'failed_form_attempt', ...FORM, element_type: 'server error' }], count: { form_submit: 0 } },
  'form network error': { has: [{ event: 'failed_form_attempt', ...FORM, element_type: 'network error' }], count: { form_submit: 0 } },
};

// ---------- checks ----------
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
function checkPush(p) {
  const errs = [];
  const keys = EVENTS[p.event];
  if (!keys) return [`unknown event "${p.event}"`];
  const got = Object.keys(p).filter(k => k !== 'event');
  const missing = keys.filter(k => !(k in p)), extra = got.filter(k => !keys.includes(k));
  if (missing.length) errs.push(`${p.event}: missing ${missing.join(', ')} (must be pushed as undefined)`);
  if (extra.length) errs.push(`${p.event}: extra ${extra.join(', ')}`);
  for (const k of got) {
    const v = p[k];
    if (v === U) continue;
    if (v === null || v === '' || (typeof v === 'string' && v.trim().toLowerCase() === 'n/a') || Number.isNaN(v)) errs.push(`${p.event}.${k} is ${JSON.stringify(v)} (use undefined)`);
    else if (NUMBER_KEYS.has(k) ? typeof v !== 'number' : typeof v !== 'string') errs.push(`${p.event}.${k} should be a ${NUMBER_KEYS.has(k) ? 'number' : 'string'}, got ${typeof v}`);
    if (typeof v === 'string' && EMAIL.test(v)) errs.push(`${p.event}.${k} contains an email address`);
    if (typeof v === 'string' && TYPED.some(t => v.includes(t))) errs.push(`${p.event}.${k} contains a typed value`);
  }
  if (p.event === 'initialize_dataLayer' && !['true', 'false'].includes(p.internal_traffic)) errs.push('internal_traffic must be "true" or "false"');
  return errs;
}

const matches = (p, want) => Object.entries(want).every(([k, v]) => p[k] === v);
function checkScenario(r, exp) {
  const errs = [];
  if (!exp) return ['no expectation written for this scenario'];
  let i = 0;
  for (const want of exp.has || []) {
    const j = r.pushes.findIndex((p, n) => n >= i && matches(p, want));
    if (j < 0) { errs.push(`expected ${JSON.stringify(want)}`); continue; }
    i = j + 1;
  }
  for (const want of exp.also || []) if (!r.pushes.some(p => matches(p, want))) errs.push(`expected ${JSON.stringify(want)}`);
  for (const [ev, n] of Object.entries(exp.count || {})) {
    const c = r.pushes.filter(p => p.event === ev).length;
    if (c !== n) errs.push(`expected ${n} × ${ev}, got ${c}: ${r.pushes.filter(p => p.event === ev).map(p => JSON.stringify(p)).join(' ')}`);
  }
  if (exp.logs !== undefined && r.logs.length < exp.logs) errs.push('?dl_debug=1 did not log pushes to the console');
  if (exp.check) { const ok = exp.check(r.pushes); if (ok !== true) errs.push(ok); }
  return errs;
}

// ---------- run ----------
const results = await runScenarios(process.argv[2]);
const rows = results.map(r => {
  const pushErrs = [...new Set(r.pushes.flatMap(checkPush))];
  const errs = [...r.errors.map(e => 'page error: ' + e), ...pushErrs, ...checkScenario(r, EXPECT[r.name])];
  return { ...r, errs, pass: errs.length === 0 };
});

// Per-event summary in the sheet's QA columns.
const byEvent = Object.keys(EVENTS).map(ev => {
  const fired = rows.filter(r => r.pushes.some(p => p.event === ev));
  const pushes = fired.flatMap(r => r.pushes.filter(p => p.event === ev));
  const bad = fired.filter(r => !r.pass);
  const negatives = rows.filter(r => EXPECT[r.name]?.count?.[ev] === 0);
  const values = [...new Set(pushes.flatMap(p => ['element_location', 'element_name', 'element_type', 'click_text', 'page_type'].filter(k => p[k] && p[k] !== U).map(k => p[k]).slice(0, 1)))];
  const note = [
    `${pushes.length} push${pushes.length === 1 ? '' : 'es'} across ${fired.length} scenario${fired.length === 1 ? '' : 's'}`,
    negatives.length ? `${negatives.length} no-fire check${negatives.length === 1 ? '' : 's'}` : '',
    values.length ? `e.g. ${values.slice(0, 3).map(v => `"${v}"`).join(', ')}` : '',
    GA4_NAME[ev] ? `sent to GA4 as ${GA4_NAME[ev]}` : '',
  ].filter(Boolean).join('; ');
  return { ev, name: GA4_NAME[ev] || ev, status: !fired.length ? 'Not fired' : bad.length ? 'Fail' : 'Pass', note };
});

const total = rows.length, passed = rows.filter(r => r.pass).length;
const allPushes = rows.reduce((n, r) => n + r.pushes.length, 0);
const esc = s => String(s).replace(/\|/g, '\\|');
const md = [
  '# dataLayer QA',
  '',
  `Generated by \`node tests/dl-qa.mjs\` on ${new Date().toISOString().slice(0, 10)}. It covers ${total} scenarios at desktop (1440px) and phone (iPhone 13) in headless Chromium, with ${allPushes} pushes checked. GTM is blocked during the run, and Formspree responses are mocked.`,
  '',
  `**Result: ${passed} of ${total} scenarios pass.** ${byEvent.filter(e => e.status === 'Pass').length} of ${byEvent.length} events pass.`,
  '',
  'Every push is checked against the spec:',
  '- the event is in the spec',
  '- it sends exactly that event\'s parameters, each one present, with missing values as `undefined`',
  '- no null, "", "n/a", or NaN',
  '- `page_percentage` is a number and every other value is a string',
  '- no email address and none of the values typed into the form or search',
  '',
  'Each scenario also checks the values the spec calls for, in order, and that nothing fires where it shouldn\'t.',
  '',
  'GTM (dev), GA4 test property and Production stay **Pending** until the container is imported and previewed (see `gtm-import/README.md`). `node tests/gtm-check.mjs` has already checked the container file itself.',
  '',
  '## By event',
  '',
  '| Event | Data layer (dev) | GTM (dev) | GA4 test property | Production | QA notes |',
  '|---|---|---|---|---|---|',
  ...byEvent.map(e => `| ${e.name === e.ev ? e.ev : `${e.name} (\`${e.ev}\`)`} | ${e.status} | Pending | Pending | Pending | ${esc(e.note)} |`),
  '',
  '## By scenario',
  '',
  '| Scenario | Viewport | Data layer (dev) | Pushes | QA notes |',
  '|---|---|---|---|---|',
  ...rows.map(r => {
    const events = [...new Set(r.pushes.map(p => p.event))].filter(e => e !== 'initialize_dataLayer' || r.name.startsWith('init') || r.name.startsWith('legacy'));
    const note = r.pass ? (EXPECT[r.name]?.note || '') : r.errs.join('; ');
    return `| ${esc(r.name)} | ${r.ctx} | ${r.pass ? 'Pass' : 'Fail'} | ${r.pushes.length} (${events.join(', ') || 'none'}) | ${esc(note)} |`;
  }),
  '',
].join('\n');

if (!process.argv[2]) fs.writeFileSync(new URL('../qa/dataLayer-qa.md', import.meta.url), md);
console.log(`${passed}/${total} scenarios pass; events: ${byEvent.map(e => `${e.name}=${e.status}`).join(', ')}`);
rows.filter(r => !r.pass).forEach(r => console.log(`FAIL ${r.name}:\n  ${r.errs.join('\n  ')}`));
const missingExp = SCENARIOS.filter(s => !EXPECT[s.name]).map(s => s.name);
if (missingExp.length) console.log('scenarios without expectations: ' + missingExp.join(', '));
process.exit(passed === total && byEvent.every(e => e.status === 'Pass') ? 0 : 1);
