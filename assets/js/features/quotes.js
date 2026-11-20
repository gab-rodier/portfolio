// Review quotes carousel (homepage Leadership section). The track scrolls natively;
// arrows, the segmented bar (wide screens) and dots (phones) jump between positions.
import { $, $$ } from '../lib/dom.js';

function initCarousel(c) {
  const track = $('.qc-tr', c), items = Array.from(track.children);
  const prev = $('.qc-prev', c), next = $('.qc-next', c), counter = $('.qc-cnt', c);
  const bar = $('.qc-bar2', c), thumbEl = $('.qc-th', c), dotsWrap = $('.qc-dots2', c), peek = $('.qc-peek', c);
  let visible, positions, target = null, controls = [], raf = 0, endTimer;

  const perView = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0, w = items[0].getBoundingClientRect().width;
    return Math.max(1, Math.floor((track.clientWidth + gap + 1) / (w + gap)));
  };
  const label = k => (visible > 1 ? `Show quotes ${k + 1} to ${k + visible} of ${items.length}` : `Show quote ${k + 1} of ${items.length}`);
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const offset = i => Math.min(items[i].offsetLeft - items[0].offsetLeft, maxScroll());
  const pad2 = x => String(x).padStart(2, '0');

  function current() {
    if (track.scrollLeft >= maxScroll() - 4) return positions - 1;
    let best = 0;
    for (let k = 0; k < positions; k++) if (Math.abs(offset(k) - track.scrollLeft) < Math.abs(offset(best) - track.scrollLeft)) best = k;
    return best;
  }

  function mark(k) {
    controls.forEach(b => {
      const on = +b.dataset.k === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
    if (counter) counter.textContent = (visible > 1 ? pad2(k + 1) + '–' + pad2(k + visible) : pad2(k + 1)) + ' / ' + pad2(items.length);
    if (peek) peek.classList.toggle('end', k === positions - 1);
  }

  function thumb() {
    if (!thumbEl) return;
    const x = track.scrollLeft;
    let pos = positions - 1;
    for (let j = 0; j < positions - 1; j++) {
      const a = offset(j), b = offset(j + 1);
      if (x <= b) { pos = j + (b > a ? Math.max(0, x - a) / (b - a) : 0); break; }
    }
    thumbEl.style.transform = `translateX(${pos * 100}%)`;
  }

  function to(k) {
    k = (k + positions) % positions;
    target = k;
    mark(k);
    track.scrollTo({ left: offset(k), behavior: 'smooth' });
  }

  function makeControl(cls, k, html) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-label', label(k));
    b.dataset.k = k;
    if (html) b.innerHTML = html;
    controls.push(b);
    return b;
  }

  function build() {
    visible = perView();
    positions = items.length - visible + 1;
    controls = [];
    if (bar) {
      $$('.qc-seg', bar).forEach(x => x.remove());
      thumbEl.style.width = (100 / positions) + '%';
      thumbEl.style.transition = 'none';
      for (let k = 0; k < positions; k++) bar.appendChild(makeControl('qc-seg', k));
    }
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (let k = 0; k < positions; k++) dotsWrap.appendChild(makeControl('qc-dot', k, '<i></i>'));
    }
    controls.forEach(b => b.addEventListener('click', () => to(+b.dataset.k)));
    thumb();
    mark(current());
  }

  prev.addEventListener('click', () => to((target != null ? target : current()) - 1));
  next.addEventListener('click', () => to((target != null ? target : current()) + 1));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { thumb(); if (target == null) mark(current()); });
    clearTimeout(endTimer);
    endTimer = setTimeout(() => { target = null; mark(current()); }, 140);
  });
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (perView() !== visible) build(); else { thumb(); mark(current()); } }, 120);
  });
  build();
}

export function initQuotes() {
  $$('.qcar3').forEach(initCarousel);
}
