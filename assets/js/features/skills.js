// Skills + Tools page: Area / Level filters, search, collapsible groups, and the reset button.
import { $, $$ } from '../lib/dom.js';

export function initSkills() {
  const view = document.getElementById('skills');
  if (!view) return;

  const rows = $$('.hr', view), radar = $$('.hr-r', view);
  const count = $('.hb-count', view), input = $('#hb-q', view), empty = $('.hb-empty', view), reset = $('.hb-reset', view);
  const groups = $$('.hgroup', view);
  let area = 'all', level = 'all', query = '';

  if (input && !input.hasAttribute('aria-label')) input.setAttribute('aria-label', 'Search skills and tools');

  // Search also matches a row's subgroup and group names.
  rows.forEach(r => {
    const sub = r.closest('.hsub'), group = r.closest('.hgroup'), names = [];
    if (sub) { const x = $('.hs-h', sub); if (x) names.push(x.textContent); }
    if (group) { const y = $('.hg-h h2', group); if (y) names.push(y.textContent); }
    r.dataset.s = names.join(' | ').toLowerCase();
  });

  const levelMatch = l => level === 'all' || (level === '3-5' ? l >= 3 && l <= 5 : String(l) === level);

  function apply() {
    let shown = 0;
    rows.forEach(r => {
      const ok = (area === 'all' || r.dataset.a === area) && levelMatch(+r.dataset.l) &&
        (!query || r.dataset.n.indexOf(query) > -1 || (r.dataset.s || '').indexOf(query) > -1);
      r.hidden = !ok;
      if (ok) shown++;
    });
    $$('.hsub', view).forEach(s => { s.hidden = !$('.hr:not([hidden])', s); });
    groups.forEach(g => { g.hidden = !$('.hr:not([hidden])', g); });
    let radarShown = 0;
    radar.forEach(r => {
      const ok = (area === 'all' || r.dataset.a === area) && level === 'all' && (!query || r.dataset.n.indexOf(query) > -1);
      r.hidden = !ok;
      if (ok) radarShown++;
    });
    $('.radar', view).hidden = !radarShown;
    empty.hidden = !!(shown + radarShown);
    count.textContent = `${shown + radarShown} of ${rows.length + radar.length} shown`;
  }

  const pick = (attr, setter) => $$(`[${attr}]`, view).forEach(b => b.addEventListener('click', () => {
    setter(b.getAttribute(attr));
    $$(`[${attr}]`, view).forEach(x => x.setAttribute('aria-pressed', x === b));
    apply();
  }));
  pick('data-fa', v => { area = v; });
  pick('data-fl', v => { level = v; });
  input.addEventListener('input', () => { query = input.value.trim().toLowerCase(); apply(); });
  apply();

  const filtering = () => (input && input.value.trim()) ||
    $('[data-fa][aria-pressed="true"]:not([data-fa="all"])', view) ||
    $('[data-fl][aria-pressed="true"]:not([data-fl="all"])', view);

  // Groups collapse unless the visitor is filtering; a manual toggle wins until the filter state changes.
  let wasFiltering = false;
  function syncGroups() {
    const f = !!filtering();
    if (f !== wasFiltering) { groups.forEach(g => { delete g.dataset.user; }); wasFiltering = f; }
    groups.forEach(g => {
      const open = g.dataset.user ? g.dataset.user === 'open' : f;
      g.classList.toggle('sk-open', open);
      const t = $('.hg-tg', g);
      if (t) t.setAttribute('aria-expanded', open);
    });
  }
  groups.forEach(g => {
    const h = $('.hg-h h2', g);
    if (!h) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hg-tg';
    toggle.setAttribute('aria-expanded', 'false');
    h.parentNode.insertBefore(toggle, h);
    toggle.appendChild(h);
    const n = document.createElement('span');
    n.className = 'hg-n';
    n.textContent = $$('.hr', g).length + ' skills';
    toggle.appendChild(n);
    toggle.addEventListener('click', () => { g.dataset.user = g.classList.contains('sk-open') ? 'closed' : 'open'; syncGroups(); });
  });
  const later = fn => () => setTimeout(fn, 0);
  if (input) input.addEventListener('input', later(syncGroups));
  $$('[data-fa],[data-fl]', view).forEach(b => b.addEventListener('click', later(syncGroups)));
  syncGroups();

  if (!reset) return;
  const updateReset = () => { reset.hidden = !filtering(); };
  reset.addEventListener('click', () => {
    const allArea = $('[data-fa="all"]', view), allLevel = $('[data-fl="all"]', view);
    if (allArea) allArea.click();
    if (allLevel) allLevel.click();
    if (input) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); }
    updateReset();
    if (input) input.focus();
  });
  if (input) input.addEventListener('input', later(updateReset));
  $$('[data-fa],[data-fl]', view).forEach(b => b.addEventListener('click', later(updateReset)));
  updateReset();
}
