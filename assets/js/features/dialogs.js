// Case study (cs-*) and work sample (ws-*) popups, built on native <dialog>.
import { $$ } from '../lib/dom.js';

export function initDialogs() {
  $$('[data-open^="cs-"],[data-open^="ws-"]').forEach(opener => {
    opener.addEventListener('click', e => {
      const dialog = document.getElementById(opener.dataset.open);
      if (dialog && dialog.showModal) { e.preventDefault(); dialog.showModal(); }
    });
  });

  $$('dialog.csd, dialog.wsd').forEach(dialog => {
    // A click on the backdrop lands on the <dialog> itself.
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    $$('[data-close]', dialog).forEach(btn => btn.addEventListener('click', () => dialog.close()));
  });
}
