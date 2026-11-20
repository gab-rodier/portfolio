// Executive Dashboard work sample: seeded fake data for the placeholder "Larkspur" site,
// redrawn as inline SVG/HTML whenever a filter, tab, or the window size changes.
import { $$ } from '../lib/dom.js';

const WEEKS = 52;
const START = new Date(2025, 3, 6);

const HOSTS = {
  all: { n: 'All hostnames', sc: 1, cvr: .0294, er: .638, adj: 0 },
  www: { n: 'www.larkspurlabs.com', sc: .62, cvr: .031, er: .62, adj: .02 },
  app: { n: 'app.larkspurlabs.com', sc: .21, cvr: .041, er: .74, adj: .05 },
  docs: { n: 'docs.larkspurlabs.com', sc: .13, cvr: .012, er: .69, adj: -.04 },
  comm: { n: 'community.larkspurlabs.com', sc: .04, cvr: .009, er: .58, adj: -.06 },
};
const DEVICE_SHARE = { all: [.58, .38, .04], www: [.52, .44, .04], app: [.81, .16, .03], docs: [.71, .26, .03], comm: [.49, .47, .04] };
const DEVICES = ['Desktop', 'Mobile', 'Tablet'];
const DEVICE_CVR = [1.18, .71, .82];
const PESO = { Paid: ['Paid search', 'Paid social', 'Display'], Earned: ['Organic search', 'Referral'], Shared: ['Organic social'], Owned: ['Direct', 'Email'] };
// [channel, PESO group, share, engagement rate, key event rate, avg duration (s), color]
const CHANNELS = [
  ['Organic search', 'Earned', .38, .68, .031, 94, 'var(--p5)'], ['Direct', 'Owned', .21, .61, .024, 88, 'var(--p3)'],
  ['Paid search', 'Paid', .14, .52, .038, 71, 'var(--rose-ink)'], ['Referral', 'Earned', .09, .66, .029, 102, 'var(--soil)'],
  ['Email', 'Owned', .07, .72, .044, 118, 'var(--p2)'], ['Organic social', 'Shared', .05, .44, .011, 49, 'var(--rose)'],
  ['Paid social', 'Paid', .04, .37, .009, 38, 'var(--rose-deep)'], ['Display', 'Paid', .02, .29, .006, 22, 'var(--ink-3)'],
];
const SOURCES = [
  ['google / organic', 'Organic search', .86], ['bing / organic', 'Organic search', .10], ['duckduckgo / organic', 'Organic search', .04],
  ['(direct) / (none)', 'Direct', 1], ['google / cpc', 'Paid search', .83], ['bing / cpc', 'Paid search', .17],
  ['g2.com / referral', 'Referral', .42], ['partner-blog.example / referral', 'Referral', .33], ['capterra.com / referral', 'Referral', .25],
  ['newsletter / email', 'Email', .68], ['product-updates / email', 'Email', .32], ['linkedin.com / social', 'Organic social', .61],
  ['reddit.com / social', 'Organic social', .39], ['linkedin / paid_social', 'Paid social', 1], ['programmatic / display', 'Display', 1],
];
const TYPES = ['Home', 'Product', 'Pricing', 'Blog', 'Docs', 'Company'];
const TYPE_COLOR = { Home: 'var(--p5)', Product: 'var(--p3)', Pricing: 'var(--rose-ink)', Blog: 'var(--soil)', Docs: 'var(--p2)', Company: 'var(--rose)' };
const TYPE_STATS = { Home: [.26, .021], Product: [.22, .034], Pricing: [.11, .061], Blog: [.21, .009], Docs: [.14, .006], Company: [.06, .015] };
const PAGES = [
  ['/', 'Home', 'www', .22, 48], ['/pricing', 'Pricing', 'www', .10, 71], ['/features/reporting', 'Product', 'www', .08, 64],
  ['/features/alerts', 'Product', 'www', .05, 58], ['/blog/ga4-migration-checklist', 'Blog', 'www', .07, 112],
  ['/blog/attribution-for-b2b', 'Blog', 'www', .04, 97], ['/customers', 'Company', 'www', .03, 52], ['/about', 'Company', 'www', .02, 41],
  ['/login', 'Product', 'app', .11, 18], ['/dashboard', 'Product', 'app', .09, 156], ['/settings/integrations', 'Product', 'app', .03, 83],
  ['/getting-started', 'Docs', 'docs', .06, 134], ['/api/reference', 'Docs', 'docs', .04, 171], ['/guides/sso', 'Docs', 'docs', .02, 122],
  ['/community/forum', 'Company', 'comm', .03, 88],
];
const LANDINGS = [
  ['/', 'Home', 'www', .24, .61, .022], ['/blog/ga4-migration-checklist', 'Blog', 'www', .12, .71, .008], ['/pricing', 'Pricing', 'www', .09, .66, .064],
  ['/features/reporting', 'Product', 'www', .07, .63, .036], ['/login', 'Product', 'app', .11, .79, .041], ['/blog/attribution-for-b2b', 'Blog', 'www', .06, .69, .011],
  ['/getting-started', 'Docs', 'docs', .07, .74, .007], ['/api/reference', 'Docs', 'docs', .05, .68, .004], ['/customers', 'Company', 'www', .03, .58, .019],
  ['/community/forum', 'Company', 'comm', .024, .57, .009],
];
const EVENTS = [['page_view', 1], ['scroll', .46], ['cta_click', .18], ['form_start', .061], ['site_search', .049], ['file_download', .034], ['generate_lead', .024], ['video_progress_75', .019]];
const TERMS = [['pricing', 412], ['api docs', 288], ['sso', 231], ['integrations', 204], ['export to csv', 167], ['case study', 139], ['security', 118]];
const CTAS = [['Book a demo', .31], ['Start free trial', .24], ['See pricing', .15], ['Read the case study', .10], ['Download the guide', .08], ['Talk to sales', .07], ['View integrations', .05]];
const FORMS = [['Demo request', 1, .42], ['Free trial sign-up', .82, .57], ['Newsletter', .64, .81], ['Contact sales', .31, .38], ['Guide download', .27, .66]];
// [key event, form/action, share, color, device multipliers]
const KEY_EVENTS = [
  ['generate_lead', 'Demo request', .34, 'var(--p5)', [1.32, .58, .74]], ['sign_up', 'Free trial sign-up', .31, 'var(--p3)', [1.12, .86, .95]],
  ['newsletter_signup', 'Newsletter', .19, 'var(--rose-ink)', [.84, 1.24, 1.08]], ['contact_submit', 'Contact sales', .09, 'var(--soil)', [1.26, .64, .8]],
  ['guide_download', 'Guide download', .07, 'var(--rose)', [.96, 1.05, 1.12]],
];
const GOALS = [
  ['New users', (S) => S * .71, 1.07], ['Newsletter subscribers', (S, KE) => KE * .19, 1.12],
  ['Demo requests', (S, KE) => KE * .34, .91], ['Organic search sessions', (S) => S * .38, .97],
];

// ---------- formatting ----------
const fmt = n => Math.round(n).toLocaleString('en-US');
const pct = (n, d) => (n * 100).toFixed(d == null ? 1 : d) + '%';
const dur = s => { s = Math.round(s); return Math.floor(s / 60) + 'm ' + ('0' + s % 60).slice(-2) + 's'; };
const kfmt = t => (t >= 1000 ? (+(t / 1000).toFixed(1)) + 'K' : fmt(t));
const sum = a => a.reduce((x, y) => x + y, 0);
const weekLabel = i => new Date(START.getTime() + i * 7 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function initDashboard() {
  if (!document.getElementById('d-kpis')) return;

  // Seeded random numbers so the sample looks the same on every visit.
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const base = [];
  for (let i = 0; i < WEEKS; i++) base.push(Math.round(3800 + i * 38 + 420 * Math.sin(i / 52 * 4 * Math.PI + 1) + (rnd() - .5) * 520));
  const noise = [];
  for (let i = 0; i < WEEKS; i++) noise.push(.88 + rnd() * .24);
  const jit = [];
  for (let i = 0; i < WEEKS * 10; i++) jit.push(.82 + rnd() * .36);

  const st = { host: 'all', range: 13, peso: { Paid: 1, Earned: 1, Shared: 1, Owned: 1 }, types: {} };
  TYPES.forEach(t => { st.types[t] = 1; });
  const el = id => document.getElementById(id);

  const series = () => {
    const h = HOSTS[st.host];
    return base.map((v, i) => v * h.sc * (st.host === 'all' ? 1 : noise[(i * 7 + h.sc * 100 | 0) % WEEKS]));
  };
  const chartWidth = () => {
    const c = document.querySelector('#ws-dash .dash'), w = c && c.clientWidth;
    return w > 0 ? Math.max(260, Math.min(w - 28, 900)) : 640;
  };
  const niceStep = range => {
    let s = Math.pow(10, Math.floor(Math.log10(Math.max(range, 1))));
    if (range / s < 3) s /= 2;
    return s;
  };
  function xLabels(R, X, h, w) {
    const sp = w < 520 ? (R > 13 ? 9 : 4) : (R > 13 ? 4 : 2);
    let xl = '';
    for (let i = 0; i < R; i += sp) {
      const an = i === 0 ? 'start' : (i + sp >= R ? 'end' : 'middle');
      xl += `<text x="${X(i)}" y="${h - 6}" text-anchor="${an}">${weekLabel(WEEKS - R + i)}</text>`;
    }
    return xl;
  }
  function grid(mn, mx, step, Y, pl, w, pr, f) {
    let g = '';
    for (let t = mn; t <= mx + 1e-9; t += step) {
      g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(t)}" y2="${Y(t)}" class="g"/><text x="${pl - 6}" y="${Y(t) + 4}" text-anchor="end">${f(t)}</text>`;
    }
    return g;
  }
  function chartLine(cur, prev, label, fmtY) {
    const R = cur.length, all = cur.concat(prev || []);
    let mx = Math.max(...all), mn = Math.min(...all);
    const step = niceStep(mx - mn);
    mx = Math.ceil(mx / step) * step;
    mn = Math.max(0, Math.floor(mn / step) * step - step);
    const w = chartWidth(), h = w < 520 ? 190 : 210, pl = 42, pr = 10, pt = 10, pb = 26;
    const X = i => pl + (w - pl - pr) * i / (R - 1);
    const Y = v => pt + (h - pt - pb) * (1 - (v - mn) / (mx - mn));
    const path = a => a.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
    const area = path(cur) + ' L' + X(R - 1) + ' ' + Y(mn) + ' L' + X(0) + ' ' + Y(mn) + ' Z';
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${label}">` + grid(mn, mx, step, Y, pl, w, pr, fmtY) + xLabels(R, X, h, w) +
      `<path d="${area}" class="ar"/>` + (prev ? `<path d="${path(prev)}" class="lp"/>` : '') +
      `<path d="${path(cur)}" class="lc"/><circle cx="${X(R - 1)}" cy="${Y(cur[R - 1])}" r="4" class="dot"/></svg>`;
  }
  const legend = (names, cols) => '<p class="d-leg2">' + names.map((n, j) => `<span><i style="background:${cols[j]}"></i>${n}</span>`).join('') + '</p>';

  /* weeks x series stacked bars */
  function stackBars(cols, names, colors, label) {
    const R = cols.length, tots = cols.map(sum);
    let mx = Math.max(...tots);
    const step = niceStep(mx);
    mx = Math.ceil(mx / step) * step;
    const w = chartWidth(), h = w < 520 ? 200 : 220, pl = 42, pr = 8, pt = 10, pb = 26, bw = (w - pl - pr) / R;
    const Y = v => pt + (h - pt - pb) * (1 - v / mx);
    let r = '';
    cols.forEach((col, i) => {
      let y0 = h - pb;
      col.forEach((v, j) => {
        const bh = (h - pt - pb) * v / mx;
        y0 -= bh;
        r += `<rect x="${(pl + i * bw + bw * .14).toFixed(1)}" y="${y0.toFixed(1)}" width="${(bw * .72).toFixed(1)}" height="${Math.max(bh, 0).toFixed(1)}" fill="${colors[j]}"></rect>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${label}">` + grid(0, mx, step, Y, pl, w, pr, kfmt) + r +
      xLabels(R, i => pl + i * bw + bw / 2, h, w) + '</svg>' + legend(names, colors);
  }

  /* weeks x series stacked area */
  function stackArea(cols, names, colors, label) {
    const R = cols.length, n = names.length, tots = cols.map(sum);
    let mx = Math.max(...tots);
    const step = niceStep(mx);
    mx = Math.ceil(mx / step) * step;
    const w = chartWidth(), h = w < 520 ? 200 : 220, pl = 42, pr = 10, pt = 10, pb = 26;
    const X = i => pl + (w - pl - pr) * i / (R - 1);
    const Y = v => pt + (h - pt - pb) * (1 - v / mx);
    let lo = cols.map(() => 0), out = '';
    for (let j = 0; j < n; j++) {
      const hi = cols.map((c, i) => lo[i] + c[j]);
      const d = hi.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ') + ' ' +
        lo.slice().reverse().map((v, k) => { const i = R - 1 - k; return 'L' + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ') + ' Z';
      out += `<path d="${d}" fill="${colors[j]}" stroke="var(--paper)" stroke-width=".8"></path>`;
      lo = hi;
    }
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${label}">` + grid(0, mx, step, Y, pl, w, pr, kfmt) + out +
      xLabels(R, X, h, w) + '</svg>' + legend(names, colors);
  }

  function bars(rows, cls) {
    const mx = Math.max(...rows.map(r => r[1])) || 1;
    return rows.map(r => `<div class="hb"><span>${r[0]}</span><div class="hb-t"><i class="${cls || ''}" style="width:${(r[1] / mx * 100).toFixed(1)}%"></i></div><b>${r[2] || fmt(r[1])}</b></div>`).join('');
  }
  const table = (head, rows) => '<table class="ws-tbl d-tbl"><thead><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' +
    rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
  const empty = msg => `<p class="d-empty">${msg}</p>`;
  const delta = d => `<span class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲ ' : '▼ '}${Math.abs(d * 100).toFixed(1)}%</span>`;

  /* squarified treemap, rendered as positioned blocks */
  function treemap(items) {
    const cw = chartWidth(), W0 = 100, H0 = 100 * (cw < 520 ? 1.7 : .36), tot = sum(items.map(x => x[1]));
    const rest = items.map(x => ({ d: x, a: x[1] / tot * W0 * H0 }));
    let rect = { x: 0, y: 0, w: W0, h: H0 };
    const out = [];
    const worst = (row, len) => {
      const s2 = sum(row.map(r => r.a)), mx = Math.max(...row.map(r => r.a)), mn = Math.min(...row.map(r => r.a));
      return Math.max(len * len * mx / (s2 * s2), s2 * s2 / (len * len * mn));
    };
    const lay = row => {
      const s2 = sum(row.map(r => r.a));
      if (rect.w >= rect.h) {
        const cw2 = s2 / rect.h;
        let y = rect.y;
        row.forEach(r => { const hh = r.a / cw2; out.push({ d: r.d, x: rect.x, y, w: cw2, h: hh }); y += hh; });
        rect = { x: rect.x + cw2, y: rect.y, w: rect.w - cw2, h: rect.h };
      } else {
        const rh = s2 / rect.w;
        let x = rect.x;
        row.forEach(r => { const ww = r.a / rh; out.push({ d: r.d, x, y: rect.y, w: ww, h: rh }); x += ww; });
        rect = { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh };
      }
    };
    let row = [];
    while (rest.length) {
      const len = Math.min(rect.w, rect.h), nx = rest[0];
      if (!row.length || worst(row.concat([nx]), len) <= worst(row, len)) { row.push(nx); rest.shift(); } else { lay(row); row = []; }
    }
    if (row.length) lay(row);
    const n = items.length;
    return `<div class="tm" style="aspect-ratio:${W0}/${H0.toFixed(2)}" role="img" aria-label="CTA clicks by link text, sized by share">` + out.map((b, i) => {
      const m = Math.round(100 - i * (78 / (n - 1))), dark = m > 52;
      return `<div class="tm-b${dark ? ' dk-t' : ''}" style="left:${(b.x / W0 * 100).toFixed(2)}%;top:${(b.y / H0 * 100).toFixed(2)}%;width:${(b.w / W0 * 100).toFixed(2)}%;height:${(b.h / H0 * 100).toFixed(2)}%;background:color-mix(in srgb, var(--p5) ${m}%, var(--paper))" title="${b.d[0]}: ${fmt(b.d[1])} clicks (${pct(b.d[2], 0)})"><b>${b.d[0]}</b><span>${pct(b.d[2], 0)} · ${fmt(b.d[1])}</span></div>`;
    }).join('') + '</div>';
  }

  /* paired columns: starts with submits inside */
  function formCols(rows) {
    const w = chartWidth(), sm = w < 520, h = sm ? 280 : 240, pl = sm ? 34 : 42, pr = 4, pt = 26, pb = sm ? 54 : 34;
    let mx = Math.max(...rows.map(r => r[1]));
    const step = niceStep(mx);
    mx = Math.ceil(mx / step) * step;
    const gw = (w - pl - pr) / rows.length, Y = v => pt + (h - pt - pb) * (1 - v / mx);
    let o = grid(0, mx, step, Y, pl, w, pr, kfmt);
    rows.forEach((r, i) => {
      const cx = pl + gw * i + gw / 2, bw = Math.min(gw * .62, 90), iw = bw * .52;
      o += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${Y(r[1]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Y(0) - Y(r[1])).toFixed(1)}" rx="3" class="fc-s"></rect>`;
      o += `<rect x="${(cx - iw / 2).toFixed(1)}" y="${Y(r[2]).toFixed(1)}" width="${iw.toFixed(1)}" height="${(Y(0) - Y(r[2])).toFixed(1)}" rx="2" class="fc-c"></rect>`;
      o += `<text x="${cx.toFixed(1)}" y="${(Y(r[1]) - 8).toFixed(1)}" text-anchor="middle" class="fc-p">${pct(r[3], 0)}</text>`;
      const words = r[0].split(' ');
      const lines = sm ? words : (w < 700 && r[0].indexOf(' ') > 0
        ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
        : [r[0]]);
      lines.forEach((t, j) => { o += `<text x="${cx.toFixed(1)}" y="${h - pb + 15 + j * (sm ? 12 : 14)}" text-anchor="middle" class="fc-l${sm ? ' sm' : ''}">${t}</text>`; });
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="Form starts and submits with start-to-completion rate">${o}</svg>` +
      '<p class="d-leg2"><span><i style="background:var(--p2)"></i>form_start</span><span><i style="background:var(--p5)"></i>form_submit</span><span>% = start-to-completion</span></p>';
  }

  function scatter(S, CV) {
    const ts = TYPES.filter(t => st.types[t]);
    if (!ts.length) return empty('Select at least one page type.');
    const pts = ts.map((t, j) => {
      const sh = TYPE_STATS[t][0] * (st.host === 'all' ? 1 : (.6 + jit[j * 13 % jit.length] * .6));
      return [t, S * sh, TYPE_STATS[t][1] * (CV / .0294)];
    });
    const w = chartWidth(), hh = w < 520 ? 240 : 260, pl = 48, pr = 16, pt = 14, pb = 34;
    let xm = Math.max(...pts.map(p => p[1])) * 1.12, ym = Math.max(...pts.map(p => p[2])) * 1.18;
    const xs = niceStep(xm), ysx = niceStep(ym * 1000) / 1000;
    xm = Math.ceil(xm / xs) * xs;
    ym = Math.ceil(ym / ysx) * ysx;
    const X = v => pl + (w - pl - pr) * v / xm, Y = v => pt + (hh - pt - pb) * (1 - v / ym);
    let g = '';
    for (let t = 0; t <= ym + 1e-9; t += ysx) g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(t)}" y2="${Y(t)}" class="g"/><text x="${pl - 6}" y="${Y(t) + 4}" text-anchor="end">${pct(t, 1)}</text>`;
    for (let t = 0; t <= xm + 1e-9; t += xs) g += `<text x="${X(t)}" y="${hh - 16}" text-anchor="${t === 0 ? 'start' : (t + xs > xm ? 'end' : 'middle')}">${kfmt(t)}</text>`;
    g += `<text x="${pl + (w - pl - pr) / 2}" y="${hh - 2}" text-anchor="middle" class="ax">Sessions (landing page type)</text>`;
    g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(CV)}" y2="${Y(CV)}" class="avg-l"/><text x="${w - pr}" y="${Y(CV) - 5}" text-anchor="end" class="avg-t"></text>`;
    const dots = pts.map(p => {
      const x = X(p[1]), y = Y(p[2]), an = x > w - 90 ? 'end' : 'start', dx = an === 'end' ? -11 : 11;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="${TYPE_COLOR[p[0]]}" stroke="var(--paper)" stroke-width="1.5"></circle><text x="${(x + dx).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${an}" class="pt-l">${p[0]}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${hh}" class="chart" role="img" aria-label="Page types by sessions and session key event rate">${g}${dots}</svg>` +
      `<p class="d-foot">Dashed line = site average (${pct(CV, 2)}). Top-right = high traffic and high conversion. Bottom-right = traffic that isn't converting yet.</p>`;
  }

  function render() {
    const R = st.range, h = HOSTS[st.host];
    const all = series(), cur = all.slice(WEEKS - R, WEEKS), prev = all.slice(WEEKS - 2 * R, WEEKS - R), S = sum(cur), P = sum(prev);
    const ER = h.er, ERp = h.er * .958, CV = h.cvr, CVp = h.cvr * .9, KE = S * CV, KEp = P * CVp;
    el('d-host-note').textContent = st.host === 'all' ? '' : 'Filtered to ' + h.n;

    /* overview */
    const kpis = [['Sessions', fmt(S), S / P - 1], ['Engaged sessions', fmt(S * ER), (S * ER) / (P * ERp) - 1], ['Engagement rate', pct(ER), ER / ERp - 1],
      ['Key events', fmt(KE), KE / KEp - 1], ['Session key event rate', pct(CV, 2), CV / CVp - 1]];
    el('d-kpis').innerHTML = kpis.map(x => {
      const up = x[2] >= 0;
      return `<div class="dk"><span>${x[0]}</span><b>${x[1]}</b><em class="${up ? 'up' : 'dn'}">${up ? '▲ ' : '▼ '}${Math.abs(x[2] * 100).toFixed(1)}% vs prior</em></div>`;
    }).join('');
    el('d-line').innerHTML = chartLine(cur, prev, 'Weekly sessions, this period versus prior period', kfmt);
    const dv = DEVICE_SHARE[st.host], dcol = ['var(--p5)', 'var(--p3)', 'var(--rose-ink)'];
    el('d-dev').innerHTML = '<div class="stack100">' + dv.map((v, j) => `<i style="width:${v * 100}%;background:${dcol[j]}" title="${DEVICES[j]}"></i>`).join('') +
      '</div><div class="dev-leg">' + dv.map((v, j) => `<div><span class="sw" style="background:${dcol[j]}"></span>${DEVICES[j]}<b>${pct(v, 0)}</b><small>${fmt(S * v)} sessions</small></div>`).join('') + '</div>';
    el('d-funnel').innerHTML = [['Awareness', 'Sessions', S, 1], ['Engagement', 'Engaged sessions', S * ER, ER], ['Completion', 'Key events', KE, CV]]
      .map(f => `<div class="fb"><span class="fb-k">${f[0]}</span><b>${fmt(f[2])}</b><span class="fb-s">${f[1]}</span><div class="fb-bar"><i style="width:${Math.max(f[3] * 100, 3).toFixed(1)}%"></i></div></div>`)
      .join('<span class="fb-arrow" aria-hidden="true">→</span>');

    /* acquisition */
    const chs = CHANNELS.filter(c => st.peso[c[1]]);
    el('d-chan').innerHTML = chs.length
      ? stackBars(cur.map((s, i) => chs.map(c => s * c[2] * jit[(i * 8 + CHANNELS.indexOf(c)) % jit.length])), chs.map(c => c[0]), chs.map(c => c[6]), 'Weekly sessions stacked by channel')
      : empty('Select at least one PESO group.');
    const channelOf = src => CHANNELS.find(c => c[0] === src[1]);
    const srcRows = SOURCES.filter(x => st.peso[channelOf(x)[1]]).map(x => {
      const c = channelOf(x), se = S * c[2] * x[2];
      return [se, [x[0], fmt(se), pct(c[3]), dur(c[5] * (0.9 + x[2] * .2)), fmt(se * c[4]), pct(c[4])]];
    }).sort((a, b) => b[0] - a[0]).slice(0, 10).map(x => x[1]);
    el('d-src').innerHTML = srcRows.length
      ? table(['Source / medium', 'Sessions', 'Engagement rate', 'Avg session duration', 'Key events', 'Key event rate'], srcRows)
      : empty('Select at least one PESO group.');

    /* content */
    el('d-scatter').innerHTML = scatter(S, CV);
    const hostOK = p => st.host === 'all' || p[2] === st.host;
    const pg = PAGES.filter(p => hostOK(p) && st.types[p[1]]);
    const tot = sum(PAGES.filter(hostOK).map(p => p[3])) || 1, PV = S * 2.4;
    const pgv = pg.map(p => [p, PV * p[3] / tot]).sort((a, b) => b[1] - a[1]);
    el('d-top').innerHTML = pgv.length
      ? table(['Page path', 'Type', 'Views', 'Avg engagement time'], pgv.slice(0, 8).map(x => [`<code>${x[0][0]}</code>`, x[0][1], fmt(x[1]), dur(x[0][4])]))
      : empty('No pages match these filters.');
    const ld = LANDINGS.filter(p => hostOK(p) && st.types[p[1]]), ltot = sum(LANDINGS.filter(hostOK).map(p => p[3])) || 1;
    const ldv = ld.map(p => [p, S * p[3] / ltot]).sort((a, b) => b[1] - a[1]);
    el('d-land').innerHTML = ldv.length
      ? table(['Landing page', 'Type', 'Sessions', 'Engagement rate', 'Key events', 'Session key event rate'], ldv.slice(0, 8).map(x => {
        const r = x[0][5] * (CV / .0294);
        return [`<code>${x[0][0]}</code>`, x[0][1], fmt(x[1]), pct(x[0][4]), fmt(x[1] * r), pct(r, 2)];
      }))
      : empty('No landing pages match these filters.');

    /* engagement */
    const pv2 = S * 2.4;
    el('d-ev').innerHTML = bars(EVENTS.map(e => [`<code>${e[0]}</code>`, pv2 * e[1]]));
    el('d-search').innerHTML = bars(TERMS.map(e => [e[0], e[1] * R / 13 * h.sc]), 'rose');
    const ctaTotal = pv2 * .18;
    el('d-cta').innerHTML = treemap(CTAS.map(c => [c[0], ctaTotal * c[1], c[1]]));
    const formStarts = S * .061;
    el('d-forms').innerHTML = formCols(FORMS.map(f => { const a = formStarts * f[1] / 3.04; return [f[0], a, a * f[2], f[2]]; }));

    /* conversions */
    el('d-ketrend').innerHTML = stackArea(cur.map((v, i) => KEY_EVENTS.map((x, j) => v * CV * x[2] * jit[(i * 5 + j * 17) % jit.length])),
      KEY_EVENTS.map(x => x[0]), KEY_EVENTS.map(x => x[3]), 'Weekly key events stacked by key event name');
    el('d-kenames').innerHTML = table(['Key event name', 'Form / action', 'Key events', 'vs prior', 'Session key event rate'], KEY_EVENTS.map((x, j) => {
      const d = (KE / KEp - 1) * [1.1, .85, 1.25, -.35, 1.05][j];
      return [`<code>${x[0]}</code>`, x[1], fmt(KE * x[2]), delta(d), pct(CV * x[2], 2)];
    }));
    const radj = h.adj - (R > 13 ? .02 : 0);
    el('d-pace').innerHTML = GOALS.map((g, j) => {
      const act = g[1](S, KE), ratio = g[2] + radj * (j % 2 ? 1 : -1), tgt = act / ratio, mx = tgt * 1.25, ok = ratio >= 1;
      const f = v => (Math.min(v, mx) / mx * 100).toFixed(1) + '%';
      return `<div class="bul"><div class="bul-h"><span>${g[0]}</span><b>${pct(ratio, 0)}</b><em class="${ok ? 'up' : 'dn'}">${ok ? 'Ahead of goal' : 'Behind goal'}</em></div>` +
        `<div class="bul-t" role="img" aria-label="${g[0]}: ${fmt(act)} of ${fmt(tgt)} goal"><i class="bd b1" style="width:${f(tgt * .7)}"></i><i class="bd b2" style="left:${f(tgt * .7)};width:${((.2 * tgt) / mx * 100).toFixed(1)}%"></i><i class="bd b3" style="left:${f(tgt * .9)};right:0"></i><i class="bul-m" style="width:${f(act)}"></i><i class="bul-g" style="left:${f(tgt)}"></i></div>` +
        `<p class="bul-f">${fmt(act)} <span>of ${fmt(tgt)} goal</span></p></div>`;
    }).join('') + '<p class="d-leg3"><span><i class="k-m"></i>Actual</span><span><i class="k-g"></i>Goal</span><span><i class="k-b"></i>Bands: under 70%, 70–90%, 90%+ of goal</span></p>';
    const cells = DEVICES.map((_, d) => [CV * DEVICE_CVR[d]].concat(KEY_EVENTS.map(x => CV * DEVICE_CVR[d] * x[2] * x[4][d])));
    const heads = ['All key events'].concat(KEY_EVENTS.map(x => x[1]));
    const colMax = heads.map((_, c) => Math.max(...cells.map(r => r[c]))), colMin = heads.map((_, c) => Math.min(...cells.map(r => r[c])));
    el('d-devcvr').innerHTML = '<table class="heat"><thead><tr><th></th>' + heads.map(x => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' +
      cells.map((r, d) => `<tr><th>${DEVICES[d]}</th>` + r.map((v, c) => {
        const s = colMax[c] === colMin[c] ? .5 : (v - colMin[c]) / (colMax[c] - colMin[c]), m = Math.round(12 + s * 70);
        return `<td style="background:color-mix(in srgb, var(--p5) ${m}%, var(--paper))" class="${m > 52 ? 'dk-t' : ''}">${pct(v, 2)}</td>`;
      }).join('') + '</tr>').join('') + '</tbody></table><p class="d-foot">Session key event rate. Shading compares devices within each column.</p>';
  }

  function pills(id, keys, obj) {
    const box = el(id);
    box.innerHTML = keys.map(k => `<button type="button" class="pill-f" aria-pressed="true" data-k="${k}">${k}</button>`).join('');
    $$('button', box).forEach(b => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      obj[b.dataset.k] = on ? 1 : 0;
      render();
    }));
  }
  pills('f-peso', Object.keys(PESO), st.peso);
  pills('f-types', TYPES, st.types);
  el('dash-range').addEventListener('change', function () { st.range = +this.value; render(); });
  el('dash-host').addEventListener('change', function () { st.host = this.value; render(); });

  $$('.dash-tabs [role=tab]').forEach(b => b.addEventListener('click', () => {
    $$('.dash-tabs [role=tab]').forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    $$('.dash-pane').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.tab; });
  }));

  // Charts are sized to the dialog, so draw again once it is open and on resize.
  $$('[data-open="ws-dash"]').forEach(b => b.addEventListener('click', () => setTimeout(render, 30)));
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 150); });
  render();
}
