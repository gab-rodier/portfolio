// Custom dropdowns: the native <select> stays in the DOM (hidden) as the source of truth,
// and a button + listbox is drawn next to it so the list always opens below the control.
import { $$, ensureId, fireChange } from '../lib/dom.js';

let open = null;

function close() {
  if (!open) return;
  open.list.hidden = true;
  open.btn.setAttribute('aria-expanded', 'false');
  open = null;
}

export function enhanceSelect(sel) {
  if (sel.dataset.cs) return;
  sel.dataset.cs = '1';
  const selId = sel.id || ensureId(sel, 'csel');

  const wrap = document.createElement('div');
  wrap.className = 'csel';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cs-btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');

  const cv = document.createElement('span');
  cv.className = 'cs-v';
  cv.id = `${selId}-cv`;

  const label = sel.id ? document.querySelector(`label[for="${sel.id}"]`) : null;
  if (label) {
    if (!label.id) label.id = `${sel.id}-lbl`;
    btn.setAttribute('aria-labelledby', `${label.id} ${cv.id}`);
  } else if (sel.closest('label')) {
    const text = sel.closest('label').querySelector('span');
    if (text) btn.setAttribute('aria-label', text.textContent);
  }
  btn.appendChild(cv);

  const caret = document.createElement('span');
  caret.className = 'cs-car';
  caret.setAttribute('aria-hidden', 'true');
  btn.appendChild(caret);

  const list = document.createElement('ul');
  list.className = 'cs-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  const sync = () => {
    cv.textContent = sel.options[sel.selectedIndex].text;
    $$('li', list).forEach((li, i) => li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false'));
  };

  Array.from(sel.options).forEach((opt, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.tabIndex = -1;
    li.textContent = opt.text;
    li.addEventListener('click', () => {
      sel.selectedIndex = i;
      fireChange(sel);
      sync();
      close();
      btn.focus();
    });
    li.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); (li.nextElementSibling || li).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (li.previousElementSibling || li).focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      if (e.key === 'Tab') close();
    });
    list.appendChild(li);
  });

  btn.addEventListener('click', () => {
    const wasOpen = open && open.btn === btn;
    close();
    if (wasOpen) return;
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    open = { wrap, btn, list };
    const current = list.children[sel.selectedIndex];
    if (current) current.focus({ preventScroll: true });
  });
  btn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && list.hidden) { e.preventDefault(); btn.click(); }
  });

  sel.parentNode.insertBefore(wrap, sel);
  wrap.append(sel, btn, list);
  sel.classList.add('cs-native');
  sel.tabIndex = -1;
  sel.setAttribute('aria-hidden', 'true');
  sel.addEventListener('change', sync);
  sync();
}

export function initCustomSelects() {
  document.addEventListener('click', e => { if (open && !open.wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { const b = open.btn; close(); b.focus(); }
  });
  window.enhanceSelect = enhanceSelect;
  $$('select').forEach(enhanceSelect);
}
