// Scoping estimator (homepage Operations section): tasks x multipliers -> hour range and tiers.
import { $$ } from '../lib/dom.js';

// [group, task, min hours, max hours, checked in the sample scope]
const TASKS = [
  ['Strategy', 'Discovery + kickoff', 4, 10, 1],
  ['Strategy', 'Measurement strategy + stakeholder questionnaires', 25, 40, 1],
  ['Tracking', 'Tracking document with data layer specs', 12, 20, 1],
  ['Tracking', 'Data layer QA, staging + production (per 5 events avg)', 10, 15, 1],
  ['Tracking', 'Tag implementation + QA, staging + production (per 5 events avg)', 14, 25, 1],
  ['Tracking', 'Marketing pixels (per 1-2 pixels avg)', 3, 5, 0],
  ['Data quality', 'Critical-issues audit', 8, 15, 0],
  ['Data quality', 'Comprehensive audit', 25, 35, 0],
  ['Data quality', 'Go-live monitoring + troubleshooting support', 4, 10, 1],
  ['Data quality', 'Automated custom data monitoring with alerts', 8, 15, 0],
  ['Reporting', 'Custom dashboard (per 2 standard pages avg)', 15, 25, 1],
  ['Reporting', 'Focused actionable analysis deliverable', 12, 20, 0],
  ['Consent', 'Consent platform config + aligned site tracking', 25, 40, 0],
  ['CRO', 'Multivariate test: proposal, build, and results', 28, 45, 0],
];

const round5 = n => Math.round(n / 5) * 5;

export function initEstimator() {
  const list = document.getElementById('est-tasks');
  if (!list) return;

  // multipliers: complexity, cross-domain, ecommerce, server-side, admin load
  const factors = { cx: 1.1, cd: 1, ec: 1, ss: 1, ad: 0.2 };
  const setText = (id, text) => { document.getElementById(id).textContent = text; };

  function calc() {
    let min = 0, max = 0, count = 0;
    TASKS.forEach((t, i) => {
      if (document.getElementById('et' + i).checked) { min += t[2]; max += t[3]; count++; }
    });
    const m = factors.cx * factors.cd * factors.ec * factors.ss * (1 + factors.ad);
    const lo = round5(min * m), hi = round5(max * m), mid = round5((min * m + max * m) / 2);
    setText('est-range', count ? `${lo}–${hi}` : '0');
    setText('est-note', count ? `${count} tasks · combined multiplier ×${m.toFixed(2)}` : 'Pick at least one task to see a range.');
    setText('t-core', (count ? lo : 0) + 'h');
    setText('t-prem', (count ? mid : 0) + 'h');
    setText('t-adv', (count ? hi : 0) + 'h');
  }

  let group = '';
  TASKS.forEach((t, i) => {
    if (t[0] !== group) {
      group = t[0];
      const g = document.createElement('p');
      g.className = 'grp';
      g.textContent = group;
      list.appendChild(g);
    }
    const row = document.createElement('label');
    row.className = 'task';
    row.innerHTML = `<input type="checkbox" id="et${i}"${t[4] ? ' checked' : ''}><span>${t[1]}</span><small>${t[2]}–${t[3]} h</small>`;
    list.appendChild(row);
    row.querySelector('input').addEventListener('change', calc);
  });

  $$('.seg-ctl').forEach(seg => {
    const buttons = $$('button', seg);
    buttons.forEach(b => b.addEventListener('click', () => {
      buttons.forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      factors[seg.dataset.f] = +b.dataset.v;
      calc();
    }));
  });

  calc();

  // "Clear All" / "Reset to Sample"
  const boxes = $$('#est-tasks input');
  const sampleChecked = boxes.map(x => x.checked);
  const sampleFactors = $$('#est-body .seg-ctl [aria-pressed=true]');
  $$('[data-tasks]').forEach(b => b.addEventListener('click', () => {
    const clear = b.dataset.tasks === 'none';
    boxes.forEach((x, i) => {
      x.checked = clear ? false : sampleChecked[i];
      x.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (!clear) sampleFactors.forEach(x => x.click());
  }));

  // Tier hour bars: each tier's hours relative to Advanced.
  const adv = document.getElementById('t-adv');
  if (adv) {
    const bars = () => {
      const v = {};
      ['core', 'prem', 'adv'].forEach(k => { v[k] = parseFloat(document.getElementById('t-' + k).textContent) || 0; });
      ['core', 'prem', 'adv'].forEach(k => { document.getElementById('hb-' + k).style.width = (v.adv ? v[k] / v.adv * 100 : 0) + '%'; });
    };
    new MutationObserver(bars).observe(adv, { childList: true, characterData: true, subtree: true });
    bars();
  }
}
