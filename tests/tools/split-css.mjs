// One-off refactor tool (kept for the record; not part of the site):
// splits assets/site.css into ordered, pretty-printed files under assets/css/ and drops
// selectors that reference a class or id that appears nowhere in the HTML or JS.
// File order = original rule order, so the cascade is unchanged by construction.
// Usage: node tests/tools/split-css.mjs
import postcss from 'postcss';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const css = await readFile(new URL('assets/site.css', root), 'utf8');

// [first line of section in site.css, file name]
const SECTIONS = [
  [1, '00-tokens'], [8, '01-base'], [37, '02-buttons'], [55, '03-rails'], [61, '04-nav'], [103, '05-hero'],
  [126, '06-bands'], [156, '07-maturity-ground'], [174, '08-cards'], [202, '09-ux-loop'], [220, '10-tools'],
  [295, '11-operations'], [360, '12-ai'], [407, '13-contact'], [457, '14-toolkit'], [500, '15-leadership'],
  [535, '16-about'], [601, '17-footer'], [641, '18-dialogs'], [678, '19-responsive'], [1147, '20-work-samples'],
  [1182, '21-polish'], [1218, '22-growth-row-wheel'], [1242, '23-cycle'], [1297, '24-figures'], [1349, '25-sector-pills'],
  [1373, '26-quotes'], [1412, '27-step-list'], [1446, '28-bookshelf'], [1540, '29-type'], [1583, '30-phone'],
];
const sectionFor = line => { let name = SECTIONS[0][1]; for (const [l, n] of SECTIONS) if (line >= l) name = n; return name; };

// Every identifier-like token in the HTML and JS: a class/id not in here can never match.
const sources = [];
for (const f of ['index.html', 'work-samples/index.html', 'skills-tools/index.html', 'contact/index.html']) sources.push(await readFile(new URL(f, root), 'utf8'));
const walk = async dir => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = new URL(e.name + (e.isDirectory() ? '/' : ''), dir);
    if (e.isDirectory()) await walk(p); else if (e.name.endsWith('.js')) sources.push(await readFile(p, 'utf8'));
  }
};
await walk(new URL('assets/js/', root));
const known = new Set(sources.join(' ').match(/[A-Za-z_][\w-]*/g));

const dead = sel => {
  // :not(.x) still matches when .x is never used, so its contents don't count.
  const names = (sel.replace(/\[[^\]]*\]/g, '').replace(/:not\([^)]*\)/g, '').replace(/:(is|where|has)\(/g, '(').match(/[.#][A-Za-z_][\w-]*/g) || []).map(t => t.slice(1));
  return names.some(n => !known.has(n));
};

const ast = postcss.parse(css);
const removed = [];
ast.walkRules(rule => {
  if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
  const keep = rule.selectors.filter(s => !dead(s));
  if (keep.length === rule.selectors.length) return;
  removed.push(...rule.selectors.filter(s => dead(s)));
  if (keep.length) rule.selectors = keep; else rule.remove();
});
ast.walkAtRules(a => { if (a.name === 'media' && !a.nodes.length) a.remove(); });

// Pretty print: one declaration per line, two-space indent.
const fmtRule = (node, indent) => {
  const pad = '  '.repeat(indent);
  if (node.type === 'comment') return `${pad}/* ${node.text} */`;
  if (node.type === 'decl') return `${pad}${node.prop}: ${node.value}${node.important ? ' !important' : ''};`;
  if (node.type === 'rule') {
    const sel = node.selectors.join(`,\n${pad}`);
    return `${pad}${sel} {\n${node.nodes.map(n => fmtRule(n, indent + 1)).join('\n')}\n${pad}}`;
  }
  if (node.type === 'atrule') {
    if (!node.nodes) return `${pad}@${node.name} ${node.params};`;
    return `${pad}@${node.name} ${node.params} {\n${node.nodes.map(n => fmtRule(n, indent + 1)).join('\n')}\n${pad}}`;
  }
  return '';
};

// Sections are grouped into a handful of files (contiguous ranges only, so order holds).
const FILES = [
  ['base', ['00-tokens', '01-base', '02-buttons', '03-rails']],
  ['header-hero', ['04-nav', '05-hero']],
  ['sections', ['06-bands', '07-maturity-ground', '08-cards', '09-ux-loop', '10-tools', '11-operations', '12-ai', '13-contact', '14-toolkit', '15-leadership', '16-about', '17-footer']],
  ['dialogs', ['18-dialogs']],
  ['responsive', ['19-responsive']],
  ['work-samples', ['20-work-samples']],
  ['widgets', ['21-polish', '22-growth-row-wheel', '23-cycle', '24-figures', '25-sector-pills', '26-quotes', '27-step-list', '28-bookshelf']],
  ['type', ['29-type']],
  ['phone', ['30-phone']],
];

const buckets = new Map();
ast.each(node => {
  const name = sectionFor(node.source.start.line);
  if (!buckets.has(name)) buckets.set(name, []);
  buckets.get(name).push(fmtRule(node, 0));
});

const out = new URL('assets/css/', root);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const files = [];
for (const [file, sections] of FILES) {
  const parts = [];
  for (const s of sections) {
    const body = (buckets.get(s) || []).filter(Boolean).join('\n\n').trim();
    if (!body || body.split('\n').every(l => l.startsWith('/*'))) continue; // only dead rules were here
    parts.push(`/* ==== ${s.replace(/^\d+-/, '').replace(/-/g, ' ')} ==== */\n\n${body}`);
  }
  if (!parts.length) continue;
  await writeFile(new URL(file + '.css', out), parts.join('\n\n') + '\n');
  files.push(file + '.css');
}
console.log(files.map(f => `<link rel="stylesheet" href="assets/css/${f}">`).join('\n'));
console.error(`removed ${removed.length} dead selectors:\n  ` + removed.join('\n  '));
