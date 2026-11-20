// Collapsible tool panels (maturity tool, estimator) and the one-line "peek" summaries
// shown on them while they are closed.
import { $, $$ } from '../lib/dom.js';

export function setTool(tool, open) {
  tool.classList.toggle('collapsed', !open);
  const toggle = $('.tool-toggle', tool);
  if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

export function initTools() {
  $$('.tool').forEach(tool => {
    const toggle = $('.tool-toggle', tool);
    if (toggle) toggle.addEventListener('click', () => setTool(tool, tool.classList.contains('collapsed')));
  });

  // CTAs like "Try the Self-Assessment" open the tool they jump to.
  $$('a[href="#assess"],a[href="#estimator"]').forEach(a => {
    a.addEventListener('click', () => {
      const tool = document.querySelector(a.getAttribute('href'));
      if (tool) setTool(tool, true);
    });
  });

  const name = document.getElementById('r-name');
  const question = document.getElementById('r-q');
  const peekAssess = document.getElementById('peek-assess');
  const range = document.getElementById('est-range');
  const peekEst = document.getElementById('peek-est');
  const update = () => {
    if (peekAssess && name && question) peekAssess.textContent = `${name.textContent}, ${question.textContent}`;
    if (peekEst && range) peekEst.textContent = `${range.textContent} hours`;
  };
  update();
  document.addEventListener('change', update);
  document.addEventListener('click', () => setTimeout(update, 0));
}
