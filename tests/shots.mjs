// Screenshot every page and its main interactive states at 4 widths.
// Usage: node tests/shots.mjs <label>   (writes to tests/screens/<label>/)
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { startServer } from './serve.mjs';

const label = process.argv[2] || 'baseline';
const only = process.argv[3]; // optional filter on shot name
const OUT = new URL(`./screens/${label}/`, import.meta.url);
const BASE = 'http://localhost:4173/portfolio/';

const WIDTHS = [
  { name: '390', ctx: { ...devices['iPhone 13'], deviceScaleFactor: 1 } },
  { name: '768', ctx: { viewport: { width: 768, height: 1024 } } },
  { name: '1024', ctx: { viewport: { width: 1024, height: 900 } } },
  { name: '1440', ctx: { viewport: { width: 1440, height: 900 } } },
];

const wait = ms => new Promise(r => setTimeout(r, ms));

async function load(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Walk the page so scroll-triggered reveals settle, then return to the top.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(innerHeight * 0.6)) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, h);
    await new Promise(r => setTimeout(r, 300));
  });
  await wait(300);
}

const visible = async (page, sel) => page.locator(sel).first().isVisible().catch(() => false);

// Each state: [name, path, async action(page) -> locator|null|'viewport']
const STATES = [
  // ---------- home ----------
  ['home-full', '', async () => null],
  ...['cs-launch', 'cs-portal', 'cs-maturity', 'cs-scoping', 'cs-turnaround', 'cs-standards'].map(id =>
    [`home-dialog-${id}`, '', async p => { await p.click(`[data-open="${id}"]`); await wait(500); return 'viewport'; }]),
  ['home-maturity-open', '', async p => { await p.click('#assess .tool-toggle'); await wait(500); return p.locator('#assess'); }],
  ['home-maturity-dropdown', '', async p => { await p.click('#assess .tool-toggle'); await wait(300); await p.click('#assess .cs-btn >> nth=1'); await wait(200); return p.locator('#assess'); }],
  ['home-maturity-result', '', async p => {
    await p.click('#assess .tool-toggle'); await wait(300);
    await p.click('#assess .cs-btn >> nth=0'); await p.click('#assess .cs-list:not([hidden]) li >> nth=3');
    await p.click('#quiz-go'); await wait(700); return p.locator('#assess');
  }],
  ['home-estimator-open', '', async p => { await p.click('#estimator .tool-toggle'); await wait(500); return p.locator('#estimator'); }],
  ['home-estimator-changed', '', async p => {
    await p.click('#estimator .tool-toggle'); await wait(300);
    await p.click('#estimator .seg-ctl[data-f="ec"] button >> nth=1');
    await p.click('[data-tasks="none"]'); await wait(200); return p.locator('#estimator');
  }],
  ...[0, 1, 2, 3].map(i => [`home-cycle-${i}`, '', async p => {
    const hit = p.locator('.rf3 .rf-hit').nth(i);
    if (await hit.isVisible()) await hit.click(); else await p.locator('.rw2 .rl button').nth(i).click();
    await wait(600); return p.locator('.rf3').first();
  }]),
  ['home-quotes-next', '', async p => { await p.click('.qcar3 .qc-next'); await wait(900); return p.locator('.qcar3'); }],
  ...[0, 1, 2].map(i => [`home-ai-info-${i}`, '', async p => { await p.locator('.rv-info').nth(i).click(); await wait(400); return p.locator('.rv-info').nth(i).locator('xpath=ancestor::section[1]'); }]),
  ...[0, 1, 2, 3, 4].map(i => [`home-sector-${i}`, '', async p => { await p.locator('.t1-b').nth(i).click(); await wait(600); return p.locator('.t1b').first(); }]),
  ...[0, 1, 2].map(i => [`home-folder-${i}`, '', async p => { await p.locator('.folder').nth(i).click(); await wait(400); return p.locator('.folder').nth(i).locator('xpath=ancestor::*[contains(@class,"toolkit") or self::section][1]'); }]),
  ...[0, 1, 2, 3].map(i => [`home-book-${i}`, '', async p => { await p.locator('.bk2-sp').nth(i).click(); await wait(900); return p.locator('.nsel2'); }]),
  ['home-xcta-hover', '', async p => { if (!(await visible(p, '#analytics .xcta'))) return 'skip'; await p.hover('#analytics .xcta'); await wait(500); return p.locator('#analytics .xcta'); }],
  ['home-leadership-tap', '', async p => { if (!(await visible(p, '.lx-t'))) return 'skip'; await p.locator('.lx-t').first().click(); await wait(400); return p.locator('.lx2').first(); }],
  ['home-menu', '', async p => { if (!(await visible(p, '.menu-btn'))) return 'skip'; await p.click('.menu-btn'); await wait(400); return 'viewport'; }],
  ['home-totop', '', async p => { await p.evaluate(() => window.scrollTo(0, innerHeight * 2)); await wait(500); return 'viewport'; }],
  ['home-legacy-hash', '#skills', async p => { await p.waitForURL(/skills-tools/); await wait(300); return 'url'; }],

  // ---------- work samples ----------
  ['ws-full', 'work-samples/', async () => null],
  ...['ws-strategy', 'ws-dash', 'ws-track', 'ws-analysis', 'ws-ops'].map(id =>
    [`ws-dialog-${id}`, 'work-samples/', async p => { await p.click(`[data-open="${id}"]`); await wait(700); return 'viewport'; }]),
  ...['ws-strategy', 'ws-analysis', 'ws-ops'].map(id =>
    [`ws-deck-${id}-slide2`, 'work-samples/', async p => { await p.click(`[data-open="${id}"]`); await wait(500); await p.click(`#${id} .deck-btn[data-dir="1"]`); await wait(700); return 'viewport'; }]),
  ...['ov', 'acq', 'con', 'eng', 'cv'].map(t =>
    [`ws-dash-tab-${t}`, 'work-samples/', async p => { await p.click('[data-open="ws-dash"]'); await wait(500); await p.click(`#ws-dash [data-tab="${t}"]`); await wait(500); return p.locator('#ws-dash .dlg-in'); }]),
  ['ws-dash-filtered', 'work-samples/', async p => {
    await p.click('[data-open="ws-dash"]'); await wait(500);
    await p.evaluate(() => {
      const s = document.getElementById('dash-host'); s.selectedIndex = 3; s.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('#f-peso .pill-f').click();
    });
    await wait(500); return p.locator('#ws-dash .dlg-in');
  }],
  ...['dd', 'dl', 'ke', 'qa', 'au'].map(t =>
    [`ws-track-tab-${t}`, 'work-samples/', async p => { await p.click('[data-open="ws-track"]'); await wait(500); await p.click(`#ws-track [data-sht="${t}"]`); await wait(400); return p.locator('#ws-track .dlg-in'); }]),

  // ---------- skills ----------
  ['skills-full', 'skills-tools/', async () => null],
  ['skills-search', 'skills-tools/', async p => { await p.fill('#hb-q', 'ga4'); await wait(500); return 'full'; }],
  ['skills-area', 'skills-tools/', async p => { await p.click('[data-fa="ana"]'); await wait(500); return 'full'; }],
  ['skills-level', 'skills-tools/', async p => { await p.click('[data-fl="8"]'); await wait(500); return 'full'; }],
  ['skills-empty', 'skills-tools/', async p => { await p.fill('#hb-q', 'zzzz'); await wait(500); return 'viewport'; }],
  ['skills-reset', 'skills-tools/', async p => { await p.click('[data-fl="8"]'); await p.fill('#hb-q', 'tag'); await wait(300); await p.click('.hb-reset'); await wait(500); return 'full'; }],
  ['skills-tooltip', 'skills-tools/', async p => {
    if (!(await visible(p, '#skills .hr'))) { await p.locator('.hg-tg').first().click(); await wait(400); }
    const r = p.locator('#skills .hr').first(); await r.scrollIntoViewIfNeeded(); await r.hover(); await wait(500); return 'viewport';
  }],

  // ---------- contact ----------
  ['contact-full', 'contact/', async () => null],
  ['contact-open', 'contact/', async p => { await p.click('.seal'); await wait(1800); return p.locator('#write'); }],
  ['contact-errors', 'contact/', async p => { await p.click('.seal'); await wait(1800); await p.click('.send'); await wait(300); return p.locator('#write'); }],
  ['contact-reason', 'contact/', async p => { await p.click('.seal'); await wait(1800); await p.click('.cform .cs-btn'); await wait(300); return p.locator('#write'); }],
  ['contact-thanks', 'contact/', async p => {
    await p.route('https://formspree.io/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await p.click('.seal'); await wait(1800);
    await p.fill('[name=name]', 'Test Person'); await p.fill('[name=email]', 'test@example.com'); await p.fill('[name=message]', 'Hello');
    await p.click('.send'); await wait(1200); return p.locator('#write');
  }],
  ['contact-sealed', 'contact/', async p => {
    await p.route('https://formspree.io/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await p.click('.seal'); await wait(1800);
    await p.fill('[name=name]', 'Test Person'); await p.fill('[name=email]', 'test@example.com'); await p.fill('[name=message]', 'Hello');
    await p.click('.send'); await wait(4500); return p.locator('#write');
  }],
  ['contact-copy', 'contact/', async p => { await p.click('#copy'); await wait(400); return p.locator('footer .ccard'); }],
];

const server = await startServer(4173);
const browser = await chromium.launch();
const log = [];
try {
  for (const w of WIDTHS) {
    await mkdir(new URL(`${w.name}/`, OUT), { recursive: true });
    const ctx = await browser.newContext({ ...w.ctx, permissions: ['clipboard-read', 'clipboard-write'] });
    // Block GTM so screenshots don't depend on third-party tags.
    await ctx.route(/googletagmanager\.com/, r => r.abort());
    for (const [name, path, act] of STATES) {
      if (only && !only.split(',').some(o => name === o || name.includes(o))) continue;
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await load(page, path);
        await page.evaluate(() => window.scrollTo(0, 0)); await wait(200);
        const target = await act(page);
        const file = new URL(`${w.name}/${name}.png`, OUT);
        const opts = { path: file.pathname.replace(/^\/([A-Za-z]:)/, '$1'), animations: 'disabled', caret: 'hide' };
        if (target === 'skip') { log.push(`${w.name} ${name}: skipped (not shown at this width)`); }
        else if (target === 'url') { log.push(`${w.name} ${name}: redirected to ${page.url()}`); await page.screenshot(opts); }
        else if (target === null || target === 'full') await page.screenshot({ ...opts, fullPage: true });
        else if (target === 'viewport') await page.screenshot(opts);
        else { await target.scrollIntoViewIfNeeded(); await target.screenshot(opts); }
        if (errors.length) log.push(`${w.name} ${name}: page errors: ${errors.join(' | ')}`);
      } catch (e) {
        log.push(`${w.name} ${name}: FAILED ${e.message.split('\n')[0]}`);
      }
      await page.close();
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(log.join('\n') || 'all shots ok');
