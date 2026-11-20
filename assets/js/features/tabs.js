// Tab-style switchers: tracking-doc tabs (work sample), toolkit folders and the
// "sectors" chips (homepage). Plus arrow-key support for every role="tab" group.
import { $$ } from '../lib/dom.js';

function initDocTabs() {
  const tabs = $$('.sh-tabs [role=tab]');
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    $$('.sh-pane').forEach(p => { p.hidden = p.dataset.sh !== b.dataset.sht; });
  }));
}

function initFolders() {
  const chips = $$('.sectors .stab'), panels = $$('.sectors .spanel-w');
  chips.forEach(c => c.addEventListener('click', () => {
    const i = +c.dataset.i;
    chips.forEach((x, j) => x.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    panels.forEach((p, j) => { p.hidden = j !== i; });
  }));

  const folders = $$('.folder'), folderPanels = $$('.fpanel');
  folders.forEach((f, i) => f.addEventListener('click', () => {
    folders.forEach((x, j) => x.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    folderPanels.forEach((p, j) => { p.hidden = j !== i; });
  }));
}

/**
 * Keyboard support for tab lists (WAI-ARIA tabs pattern): Left/Right (and Home/End) move
 * between tabs and select them. Only the selected tab sits in the Tab order.
 * Works on any group of elements with role="tab" or aria-selected that share a parent.
 */
function initTabKeys() {
  const groups = new Map();
  $$('[role=tab]').forEach(t => {
    const list = t.parentElement;
    if (!groups.has(list)) groups.set(list, []);
    groups.get(list).push(t);
  });
  groups.forEach(tabs => {
    const sync = () => tabs.forEach(t => { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; });
    sync();
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => setTimeout(sync, 0));
      t.addEventListener('keydown', e => {
        let k = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') k = 0;
        if (e.key === 'End') k = tabs.length - 1;
        if (k === null) return;
        e.preventDefault();
        e.stopPropagation(); // don't also flip a slide deck in the same dialog
        tabs[k].focus();
        tabs[k].click();
      });
    });
  });
}

export function initTabs() {
  initDocTabs();
  initFolders();
}

export { initTabKeys };
