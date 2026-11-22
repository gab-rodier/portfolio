// Drive each tracked interaction and print what reached the dataLayer.
// Usage: node tests/dl-check.mjs [filter]   (filter matches scenario names)
// GTM is blocked; link navigation is cancelled after tracking sees the click.
import { chromium, devices } from '@playwright/test';
import { startServer } from './serve.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'http://localhost:4174/portfolio/';
const only = process.argv[2];
const wait = ms => new Promise(r => setTimeout(r, ms));

// Record every push, keeping undefined values visible (JSON would drop them).
const RECORDER = () => {
  window.__pushes = [];
  const dl = (window.dataLayer = window.dataLayer || []);
  const orig = dl.push.bind(dl);
  dl.push = (...args) => {
    args.forEach(o => {
      if (o && typeof o.event === 'string' && !o.event.startsWith('gtm.')) {
        const c = {};
        Object.keys(o).forEach(k => { c[k] = o[k] === undefined ? '(undefined)' : o[k]; });
        window.__pushes.push(c);
      }
    });
    return orig(...args);
  };
  // Keep the page in place so pushes from link clicks can be read.
  window.addEventListener('click', e => {
    const a = e.target instanceof Element && e.target.closest('a[href]');
    if (a && !a.hasAttribute('data-open') && !/^#/.test(a.getAttribute('href'))) e.preventDefault();
  });
};

const S = [];
const add = (name, path, fn, ctx = 'desktop') => S.push({ name, path, fn, ctx });

// ---------- page loads ----------
add('init home', '', async () => {});
add('init home #ai + query', '?utm_source=test&dl_debug=1#ai', async () => {});
add('init work samples', 'work-samples/', async () => {});
add('init skills', 'skills-tools/', async () => {});
add('init contact', 'contact/', async () => {});
add('init internal=1 then plain', '?internal=1', async p => { await p.goto(BASE); await wait(300); });
add('init internal=0 clears', '?internal=1', async p => { await p.goto(BASE + '?internal=0'); await wait(200); await p.goto(BASE); await wait(300); });
add('legacy #skills redirect', '#skills', async p => { await p.waitForURL(/skills-tools/); await wait(400); });
add('init email in query', '?ref=someone%40example.com', async () => {});

// ---------- scroll + sections ----------
add('scroll + section_view', '', async p => {
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await wait(1300); }
});
add('section flyby (<1s) no view', '', async p => {
  // Scroll there and back inside the page, so test round trips can't stretch the 300ms.
  await p.evaluate(() => new Promise(done => {
    window.scrollTo(0, document.getElementById('leadership').offsetTop);
    setTimeout(() => { window.scrollTo(0, 0); done(); }, 300);
  }));
  await wait(1500);
});

// ---------- nav + footer + CTAs ----------
add('main nav link', '', async p => { await p.click('.links a[href="#about"]'); });
add('main nav logo', 'contact/', async p => { await p.click('header .brand'); });
add('main nav Get in Touch btn', '', async p => { await p.click('.nav-cta .btn.primary'); });
add('hamburger open + link + close', '', async p => { await p.click('.menu-btn'); await wait(200); await p.click('#takeover a[href="contact/"]'); await p.click('.menu-btn'); await wait(200); await p.click('#takeover .to-close'); }, 'phone');
add('hamburger logo', 'contact/', async p => {
  if (!(await p.$('#takeover .to-home'))) return;
  await p.click('.menu-btn'); await wait(200); await p.click('#takeover .to-home');
}, 'phone');
add('main nav AI + Skills + Tools links', '', async p => {
  if (!(await p.$('.links a[href="#ai"]'))) return;
  await p.click('.links a[href="#ai"]'); await p.click('.links a[href="skills-tools/"]');
});
add('footer email me', '', async p => { await p.click('footer .cc-a.pri'); });
add('footer linkedin', '', async p => { await p.click('footer .cc-a[href*=linkedin]'); });
add('footer resume', '', async p => { await p.click('footer .cc-a[download]'); });
add('footer explore', '', async p => { await p.click('footer .fx a[href*="ai"]'); });
add('footer logo', 'work-samples/', async p => { await p.click('footer .fbrand'); });
add('footer copy', '', async p => { await p.click('#copy'); });
add('hero CTAs', '', async p => { await p.click('#top a.btn.primary'); await p.click('#top a[href*=linkedin]'); await p.click('#top a[download]'); });
add('section CTAs', '', async p => { for (const s of ['#analytics .xcta', '#ai .kbtn', '#operations .xcta', '#about .kbtn']) await p.click(s); });
add('work samples CTAs', 'work-samples/', async p => { await p.click('.wsback'); await p.click('.wsc-pri'); await p.click('#samples a[download]'); });
add('contact page links', 'contact/', async p => { await p.click('.cp-alt a[href^=mailto]'); await p.click('.cp-alt .cp-dl'); await p.click('.wsback'); });
add('back to top', '', async p => { await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6)); await wait(600); await p.click('.totop'); });

// ---------- modals + tools ----------
add('case study open/close', '', async p => { await p.click('[data-open="cs-turnaround"]'); await wait(300); await p.click('#cs-turnaround .dlg-close'); await wait(200); });
add('case study escape close', '', async p => { await p.click('[data-open="cs-launch"]'); await wait(300); await p.keyboard.press('Escape'); await wait(200); });
add('work sample open/close', 'work-samples/', async p => { await p.click('[data-open="ws-dash"]'); await wait(400); await p.click('#ws-dash .dlg-close'); await wait(200); });
add('try the self-assessment CTA', '', async p => { await p.click('[data-open="cs-maturity"]'); await wait(300); await p.click('#cs-maturity a[href="#assess"]'); await wait(300); });
add('maturity tool', '', async p => {
  await p.click('#assess .tool-toggle'); await wait(300);
  await p.click('#assess .cs-btn >> nth=1'); await p.click('#assess .cs-list:not([hidden]) li >> nth=3');
  await p.click('#quiz-go'); await wait(200);
  await p.click('#assess .tool-toggle');
});
add('maturity dropdown by keyboard', '', async p => {
  await p.click('#assess .tool-toggle'); await wait(300);
  await p.click('#assess .cs-btn >> nth=0'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
});
add('scoping tool', '', async p => {
  await p.click('#estimator .tool-toggle'); await wait(300);
  await p.click('#et5'); await p.click('#et7');
  await p.click('#estimator .seg-ctl[data-f="cx"] button >> nth=2');
  await p.click('[data-tasks="none"]'); await p.click('[data-tasks="sample"]');
});

// ---------- expandables ----------
add('cycle steps + list + keys', '', async p => {
  await p.locator('.rf3 .rf-hit').nth(2).click(); await p.locator('.rw2 .rl button').nth(0).click();
  await p.locator('.rf3 .rf-hit').nth(0).click(); // already showing: no push
  await p.locator('.rf3 .rf-hit').nth(0).focus(); await p.keyboard.press('ArrowRight'); await wait(100);
});
add('cycle arrows (phone)', '', async p => { await p.locator('.rf3 .rf-next').scrollIntoViewIfNeeded(); await p.click('.rf3 .rf-next'); await p.click('.rf3 .rf-prev'); await wait(100); }, 'phone');
add('sector pills', '', async p => { await p.locator('.t1-b').nth(2).click(); await p.locator('.t1-b').nth(2).click(); });
add('folders', '', async p => { await p.locator('.folder').nth(1).click(); });
add('bookshelf', '', async p => { await p.locator('.bk2-sp').nth(3).click(); await wait(300); });
add('leadership tap (phone)', '', async p => { await p.locator('.lx-t').first().click(); await p.locator('.lx-t').first().click(); }, 'phone');
add('tracking doc tabs', 'work-samples/', async p => { await p.click('[data-open="ws-track"]'); await wait(300); await p.click('#ws-track [data-sht="ke"]'); await p.keyboard.press('ArrowRight'); await wait(100); });
add('dashboard tabs', 'work-samples/', async p => { await p.click('[data-open="ws-dash"]'); await wait(300); await p.click('#ws-dash [data-tab="con"]'); });

// ---------- sliders ----------
add('quotes arrows + bar', '', async p => {
  await p.click('.qcar3 .qc-next'); await wait(700); await p.click('.qcar3 .qc-prev'); await wait(700);
  await p.locator('.qcar3 .qc-seg').last().click(); await wait(700);
});
// Card row arrows + dots (added with the layout PR; skipped on pages without them)
add('case row arrows + dot', '', async p => {
  if (!(await p.$('#analytics .oc-arr'))) return;
  await p.locator('#analytics .oc-arr.next').scrollIntoViewIfNeeded();
  await p.click('#analytics .oc-arr.next'); await wait(1200);
  await p.click('#analytics .oc-arr.prev'); await wait(1200);
  await p.click('#analytics .oc-pips button:nth-child(3)'); await wait(1200);
  // Disabled at the end of the row: a forced click must push nothing.
  await p.click('#analytics .oc-arr.next', { force: true }); await wait(1200);
}, 'phone');
add('work sample card arrows', 'work-samples/', async p => {
  if (!(await p.$('#samples .oc-arr'))) return;
  await p.setViewportSize({ width: 820, height: 1000 }); await wait(300);
  await p.locator('#samples .oc-arr.next').scrollIntoViewIfNeeded();
  await p.click('#samples .oc-arr.next'); await wait(1200);
});
add('quotes arrow key', '', async p => { await p.locator('.qcar3 .qc-tr').focus(); await p.keyboard.press('ArrowRight'); await wait(700); });
add('deck arrows + dots + keys', 'work-samples/', async p => {
  await p.click('[data-open="ws-ops"]'); await wait(300);
  await p.click('#ws-ops .deck-btn[data-dir="1"]'); await p.click('#ws-ops .wdot >> nth=3');
  await p.keyboard.press('ArrowLeft'); await wait(100);
  await p.click('#ws-ops .deck-btn[data-dir="-1"]'); await p.click('#ws-ops .deck-btn[data-dir="-1"]');
});

// ---------- filters ----------
add('skills chips', 'skills-tools/', async p => { await p.click('[data-fa="ana"]'); await p.click('[data-fl="8"]'); await wait(100); });
add('re-click same choices (no pushes)', 'skills-tools/', async p => { await p.click('[data-fl="8"]'); await p.click('[data-fl="8"]'); await p.click('[data-fl="8"]'); await p.click('[data-fa="all"]'); await wait(100); });
add('re-pick same dropdown/chip (no pushes)', '', async p => {
  await p.click('#assess .tool-toggle'); await wait(300);
  await p.click('#assess .cs-btn >> nth=0'); await p.click('#assess .cs-list:not([hidden]) li >> nth=1'); // already selected
  await p.click('#estimator .tool-toggle'); await wait(300);
  await p.click('#estimator .seg-ctl[data-f="cx"] button >> nth=1'); // already pressed
  await p.click('#assess .cs-btn >> nth=0'); await p.click('#assess .cs-list:not([hidden]) li >> nth=2'); // real change
});
add('dashboard same option (no push)', 'work-samples/', async p => {
  await p.click('[data-open="ws-dash"]'); await wait(300);
  await p.click('#ws-dash .dash-range .cs-btn >> nth=0'); await p.click('#ws-dash .cs-list:not([hidden]) li >> nth=0');
});
add('skills search', 'skills-tools/', async p => { await p.click('[data-fl="8"]'); await p.fill('#hb-q', 'platf'); await wait(500); await p.fill('#hb-q', 'platform'); await wait(2300); });
add('skills search PII', 'skills-tools/', async p => {
  await p.fill('#hb-q', 'jane@example.com'); await wait(2300);
  await p.fill('#hb-q', '(215) 555-0100'); await wait(2300);
  await p.fill('#hb-q', '1234567890'); await wait(2300);
  await p.fill('#hb-q', ''); await wait(2300);
});
add('skills reset', 'skills-tools/', async p => { await p.click('[data-fl="8"]'); await p.fill('#hb-q', 'tag'); await p.click('.hb-reset'); await wait(2300); });
add('skills group toggle (phone)', 'skills-tools/', async p => { await p.locator('.hg-tg').first().click(); await p.locator('.hg-tg').first().click(); }, 'phone');
add('dashboard filters', 'work-samples/', async p => {
  await p.click('[data-open="ws-dash"]'); await wait(300);
  await p.click('#ws-dash .dash-range .cs-btn >> nth=0'); await p.click('#ws-dash .cs-list:not([hidden]) li >> nth=3');
  await p.click('#ws-dash .dash-range .cs-btn >> nth=1'); await p.click('#ws-dash .cs-list:not([hidden]) li >> nth=1');
  await p.click('#ws-dash [data-tab="acq"]'); await wait(200);
  await p.click('#f-peso .pill-f >> nth=0'); await p.click('#f-peso .pill-f >> nth=0');
});

// ---------- info hover ----------
add('AI info hover 1.6s', '', async p => { const b = p.locator('.rv-info').first(); await b.scrollIntoViewIfNeeded(); await b.hover(); await wait(1700); await p.mouse.move(0, 0); await wait(200); await b.hover(); await wait(1700); });
add('AI info short hover', '', async p => { const b = p.locator('.rv-info').nth(1); await b.scrollIntoViewIfNeeded(); await b.hover(); await wait(800); await p.mouse.move(0, 0); await wait(1000); });
add('AI info click while hovering', '', async p => { const b = p.locator('.rv-info').nth(2); await b.scrollIntoViewIfNeeded(); await b.click(); await wait(1700); await p.mouse.move(0, 0); await wait(300); });
add('AI info tap (phone)', '', async p => { const b = p.locator('.rv-info').first(); await b.scrollIntoViewIfNeeded(); await b.tap(); await wait(1700); await p.locator('body').tap({ position: { x: 5, y: 5 } }); await b.tap(); await wait(300); }, 'phone');
add('skills row hover', 'skills-tools/', async p => {
  const withNote = p.locator('#skills .hr:has(.hb-tip span)').first(); await withNote.hover(); await wait(1700);
  const basic = p.locator('#skills .hr:not(:has(.hb-tip span))').first(); await basic.scrollIntoViewIfNeeded(); await basic.hover(); await wait(1700);
});
add('skills row keyboard focus', 'skills-tools/', async p => { await p.locator('#skills .hr').first().focus(); await wait(1700); });
add('skills row tap (phone)', 'skills-tools/', async p => { await p.locator('.hg-tg').first().click(); await wait(300); const r = p.locator('#skills .hr').first(); await r.tap(); await wait(1700); await r.tap(); await wait(200); }, 'phone');

// ---------- contact form ----------
const openEnvelope = async p => { await p.click('.seal'); await wait(1500); };
add('form view + validation error', 'contact/', async p => { await openEnvelope(p); await p.click('.send'); await wait(200); });
add('form submit success', 'contact/', async p => {
  await p.route('https://formspree.io/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await openEnvelope(p);
  await p.fill('[name=name]', 'Test Person'); await p.fill('[name=email]', 'test@example.com'); await p.fill('[name=message]', 'Hello');
  await p.click('.cform .cs-btn'); await p.click('.cform .cs-list:not([hidden]) li >> nth=4');
  await p.click('.send'); await wait(1000);
});
add('form server error', 'contact/', async p => {
  await p.route('https://formspree.io/**', r => r.fulfill({ status: 422, contentType: 'application/json', body: '{"errors":[{"message":"Bad"}]}' }));
  await openEnvelope(p);
  await p.fill('[name=name]', 'T'); await p.fill('[name=email]', 't@example.com'); await p.fill('[name=message]', 'x');
  await p.click('.send'); await wait(800);
});
add('form network error', 'contact/', async p => {
  await p.route('https://formspree.io/**', r => r.abort());
  await openEnvelope(p);
  await p.fill('[name=name]', 'T'); await p.fill('[name=email]', 't@example.com'); await p.fill('[name=message]', 'x');
  await p.click('.send'); await wait(800);
});

// ---------- run ----------
// Runs every scenario (or those whose name includes `filter`) and returns
// [{ name, ctx, pushes, errors, logs }]. tests/dl-qa.mjs uses this for the formal QA file.
export const SCENARIOS = S;
export async function runScenarios(filter) {
  const results = [];
  const server = await startServer(4174);
  const browser = await chromium.launch();
  const CTX = {
    desktop: { viewport: { width: 1440, height: 900 } },
    phone: { ...devices['iPhone 13'] },
  };
  try {
    for (const s of S) {
      if (filter && !s.name.includes(filter)) continue;
      const ctx = await browser.newContext(CTX[s.ctx]);
      await ctx.route(/googletagmanager\.com/, r => r.abort());
      await ctx.addInitScript(RECORDER);
      const page = await ctx.newPage();
      const errors = [], logs = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.text().startsWith('[dataLayer]')) logs.push(m.text()); });
      let pushes = [];
      try {
        await page.goto(BASE + s.path, { waitUntil: 'load' });
        await wait(400);
        await s.fn(page);
        await wait(150);
        pushes = await page.evaluate(() => window.__pushes);
      } catch (e) {
        errors.push('SCENARIO FAILED: ' + e.message.split('\n')[0]);
        pushes = await page.evaluate(() => window.__pushes).catch(() => []);
      }
      results.push({ name: s.name, ctx: s.ctx, pushes, errors, logs });
      await ctx.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  return results;
}

// Printed when run directly (npm run dl); importing this file only loads the scenarios.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const out = [];
  for (const r of await runScenarios(only)) {
    out.push(`\n### ${r.name} (${r.ctx})`);
    r.pushes.forEach(o => out.push(JSON.stringify(o)));
    if (r.logs.length) out.push(`(console: ${r.logs.length} [dataLayer] lines)`);
    if (r.errors.length) out.push('ERRORS: ' + r.errors.join(' | '));
  }
  console.log(out.join('\n'));
}
