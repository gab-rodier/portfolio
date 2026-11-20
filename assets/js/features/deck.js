// Slide decks inside work sample popups: arrows, dots, keyboard arrows, and swipe.
import { $, $$ } from '../lib/dom.js';

export function initDecks() {
  $$('dialog .deck').forEach(deck => {
    const slides = $$('.slide', deck), dots = $$('.wdot', deck), count = $('.deck-count', deck), btns = $$('.deck-btn', deck);
    const n = slides.length;
    let i = 0;

    function go(k) {
      i = Math.max(0, Math.min(n - 1, k));
      slides.forEach((s, j) => { s.classList.toggle('on', j === i); s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      count.textContent = `${i + 1} / ${n}`;
      btns[0].disabled = i === 0;
      btns[1].disabled = i === n - 1;
    }

    btns.forEach(b => b.addEventListener('click', () => go(i + (+b.dataset.dir))));
    dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.go)));

    const dialog = deck.closest('dialog');
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
    });

    let startX = null;
    deck.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
      startX = null;
    });

    dialog.addEventListener('close', () => go(0));
    go(0);
  });
}
