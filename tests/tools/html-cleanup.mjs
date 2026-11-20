// One-off refactor tool (kept for the record; not part of the site). Rewrites the four pages:
//  - site.css -> the split stylesheets in assets/css/, site.js -> the ES module entry
//  - each page keeps only the dialogs it can open (cs-* on home, ws-* on work samples)
//  - inline data-URI favicons -> files in assets/img/
//  - the 62KB menu-logo bloom path -> the footer logo's 9KB path (same artwork, fewer points)
// (Lazy-loading the bookshelf images was tried and dropped: the shelf measures covers on load.)
// Usage: node tests/tools/html-cleanup.mjs
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const CSS = ['base', 'header-hero', 'sections', 'dialogs', 'responsive', 'work-samples', 'widgets', 'type', 'phone'];
const PAGES = [
  { file: 'index.html', prefix: '', dialogs: /^cs-/ },
  { file: 'work-samples/index.html', prefix: '../', dialogs: /^ws-/ },
  { file: 'skills-tools/index.html', prefix: '../', dialogs: null },
  { file: 'contact/index.html', prefix: '../', dialogs: null },
];

const one = (html, re, what) => {
  const m = html.match(re);
  if (!m) throw new Error('not found: ' + what);
  return m;
};

for (const { file, prefix, dialogs } of PAGES) {
  const url = new URL(file, root);
  let html = await readFile(url, 'utf8');
  const before = html.length;

  // stylesheets + script
  html = html.replace(`<link rel="stylesheet" href="${prefix}assets/site.css">`,
    CSS.map(n => `<link rel="stylesheet" href="${prefix}assets/css/${n}.css">`).join('\n'));
  html = html.replace(`<script src="${prefix}assets/site.js"></script>`, `<script type="module" src="${prefix}assets/js/main.js"></script>`);
  one(html, /assets\/js\/main\.js/, 'script swap');
  one(html, /assets\/css\/phone\.css/, 'css swap');

  // dialogs this page can't open
  html = html.replace(/<dialog\b[^>]*\bid="([^"]+)"[\s\S]*?<\/dialog>/g, (m, id) => (dialogs && dialogs.test(id) ? m : ''));

  // favicons
  const icon = one(html, /<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,([^"]+)">/, 'svg favicon');
  await writeFile(new URL('assets/img/favicon.svg', root), decodeURIComponent(icon[1]));
  html = html.replace(icon[0], `<link rel="icon" type="image/svg+xml" href="${prefix}assets/img/favicon.svg">`);
  const touch = one(html, /<link rel="apple-touch-icon" href="data:image\/png;base64,([^"]+)">/, 'touch icon');
  await writeFile(new URL('assets/img/apple-touch-icon.png', root), Buffer.from(touch[1], 'base64'));
  html = html.replace(touch[0], `<link rel="apple-touch-icon" href="${prefix}assets/img/apple-touch-icon.png">`);

  // menu logo: reuse the footer logo's bloom path (both are the inverse logo)
  const blooms = [...html.matchAll(/<path class="lg-bloom" d="[^"]+"/g)].map(m => m[0]);
  if (blooms.length === 3 && blooms[1].length > blooms[2].length) html = html.replace(blooms[1], blooms[2]);

  await writeFile(url, html);
  console.log(`${file}: ${before} -> ${html.length} chars`);
}
