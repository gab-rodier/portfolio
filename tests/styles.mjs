// Computed-style snapshot: a finer check than pixels for the CSS refactor.
// Usage: node tests/styles.mjs <label>         -> tests/screens/<label>/styles-<width>-<page>.json
//        node tests/styles.mjs --diff a b      -> prints elements whose computed styles differ
import { chromium, devices } from '@playwright/test';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { startServer } from './serve.mjs';

const dir = l => new URL(`./screens/${l}/`, import.meta.url);
const PAGES = { home: '', ws: 'work-samples/', skills: 'skills-tools/', contact: 'contact/' };
const WIDTHS = [
  { name: '390', ctx: { ...devices['iPhone 13'], deviceScaleFactor: 1 } },
  { name: '768', ctx: { viewport: { width: 768, height: 1024 } } },
  { name: '1024', ctx: { viewport: { width: 1024, height: 900 } } },
  { name: '1440', ctx: { viewport: { width: 1440, height: 900 } } },
];
const PROPS = ['display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius',
  'color', 'background-color', 'background-image', 'background-size', 'background-position', 'font-family', 'font-size', 'font-weight', 'line-height',
  'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'white-space', 'opacity', 'visibility', 'transform', 'box-shadow', 'z-index',
  'overflow-x', 'overflow-y', 'flex-direction', 'flex-wrap', 'flex-basis', 'flex-grow', 'flex-shrink', 'justify-content', 'align-items', 'gap',
  'grid-template-columns', 'grid-template-rows', 'grid-column-start', 'grid-column-end', 'order', 'fill', 'stroke', 'stroke-width', 'outline-style',
  'cursor', 'transition-property', 'transition-duration', 'animation-name', 'clip-path', 'filter', 'aspect-ratio', 'object-fit', 'list-style-type', 'content'];

async function snap(label) {
  const server = await startServer(4174);
  const browser = await chromium.launch();
  await mkdir(dir(label), { recursive: true });
  for (const w of WIDTHS) {
    const ctx = await browser.newContext(w.ctx);
    await ctx.route(/googletagmanager\.com/, r => r.abort());
    for (const [pname, path] of Object.entries(PAGES)) {
      const page = await ctx.newPage();
      await page.goto('http://localhost:4174/portfolio/' + path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const data = await page.evaluate(PROPS => {
        // Elements with an id are keyed by id alone, so removing other dialogs doesn't shift keys.
        const key = el => { const parts = []; for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
          if (e.id && !/^(csel|rv-pop)-\d+$/.test(e.id)) { parts.unshift('#' + e.id); break; }
          let i = 1; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++;
          parts.unshift(e.tagName.toLowerCase() + ':' + i); } return parts.join('>'); };
        const out = {};
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
          const k = key(el);
          for (const pseudo of [null, '::before', '::after']) {
            const cs = getComputedStyle(el, pseudo);
            if (pseudo && (cs.content === 'none' || cs.content === 'normal')) continue;
            out[k + (pseudo || '')] = PROPS.map(p => cs.getPropertyValue(p)).join('|');
          }
        }
        return out;
      }, PROPS);
      await writeFile(new URL(`styles-${w.name}-${pname}.json`, dir(label)), JSON.stringify(data));
      await page.close();
    }
    await ctx.close();
  }
  await browser.close(); server.close();
}

async function diff(a, b) {
  const files = (await readdir(dir(a))).filter(f => f.startsWith('styles-'));
  let total = 0;
  for (const f of files) {
    const A = JSON.parse(await readFile(new URL(f, dir(a)), 'utf8'));
    const B = JSON.parse(await readFile(new URL(f, dir(b)), 'utf8').catch(() => '{}'));
    const changed = [], missing = [], added = [];
    for (const k of Object.keys(A)) {
      if (!(k in B)) { missing.push(k); continue; }
      if (A[k] !== B[k]) {
        const va = A[k].split('|'), vb = B[k].split('|');
        changed.push(k + '\n      ' + PROPS.map((p, i) => va[i] !== vb[i] ? `${p}: ${va[i]} -> ${vb[i]}` : null).filter(Boolean).join('\n      '));
      }
    }
    for (const k of Object.keys(B)) if (!(k in A)) added.push(k);
    total += changed.length;
    console.log(`${f}: ${changed.length} changed, ${missing.length} only in ${a}, ${added.length} only in ${b}`);
    changed.slice(0, 15).forEach(c => console.log('    ' + c));
    if (process.env.SHOW_MISSING) { missing.slice(0, 20).forEach(m => console.log('    - ' + m)); added.slice(0, 20).forEach(m => console.log('    + ' + m)); }
  }
  console.log(total ? `TOTAL CHANGED: ${total}` : 'NO COMPUTED-STYLE CHANGES');
}

if (process.argv[2] === '--diff') await diff(process.argv[3], process.argv[4]);
else await snap(process.argv[2] || 'baseline');
