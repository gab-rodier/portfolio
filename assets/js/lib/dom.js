// Small DOM helpers shared by the feature modules.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Debounce for resize handlers. */
export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Run one feature's setup. A failure is logged and never stops the other features. */
export function run(name, init) {
  try {
    init();
  } catch (err) {
    console.warn(`[site] ${name} failed to start`, err);
  }
}

/** Fire a native change event, the way a user selection would. */
export const fireChange = el => el.dispatchEvent(new Event('change', { bubbles: true }));

let uid = 0;
/** Give an element an id if it has none, and return it. */
export function ensureId(el, prefix) {
  if (!el.id) el.id = `${prefix}-${++uid}`;
  return el.id;
}
