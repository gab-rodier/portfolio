// "Off the Clock" bookshelf (homepage About section): click a spine to open its cover.
// Covers are measured off-screen first so each one opens straight to its final size.
import { $, $$ } from '../lib/dom.js';

function initShelf(shelf) {
  const books = $$('.bk2', shelf), row = $('.s2-row', shelf), heights = [];
  const titleStep = parseFloat(shelf.getAttribute('data-dt') || '0.5');
  let current = null;

  const spineWidth = () => Math.min(...books.map(o => (o.classList.contains('on') ? 99 : parseFloat(getComputedStyle(o).flexBasis) || 50)));
  const coverWidth = () => {
    const cs = getComputedStyle(row), gap = parseFloat(cs.columnGap) || 5;
    const avail = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.min(310, avail - (books.length - 1) * (spineWidth() + gap));
  };
  const offscreenCover = (book, w) => {
    const c = $('.bk2-c', book).cloneNode(true);
    c.style.cssText = `position:absolute;inset:auto;left:-9999px;top:0;width:${w}px;height:auto;visibility:hidden;opacity:1;transition:none;box-sizing:border-box;padding:${.05 * w}px ${.06 * w}px ${.06 * w}px ${.19 * w}px`;
    book.appendChild(c);
    return c;
  };

  function measure() {
    const w = coverWidth();
    const clones = books.map(b => {
      const c = offscreenCover(b, w);
      $('.bc-t', c).style.removeProperty('font-size');
      $('.bc-p', c).style.removeProperty('font-size');
      return c;
    });
    // One title size for every cover: shrink all by the tightest fit.
    let f = 1;
    clones.forEach(c => { const t = $('.bc-t', c); if (t.scrollWidth > t.clientWidth + 1) f = Math.min(f, t.clientWidth / t.scrollWidth); });
    const titleSize = parseFloat(getComputedStyle($('.bc-t', clones[0])).fontSize) * f * (f < 1 ? 0.98 : 1);
    clones.forEach((c, i) => {
      const t = $('.bc-t', c), p = $('.bc-p', c);
      t.style.setProperty('font-size', titleSize + 'px', 'important');
      const subSize = Math.min(parseFloat(getComputedStyle(p).fontSize), titleSize - titleStep);
      p.style.setProperty('font-size', subSize + 'px', 'important');
      heights[i] = Math.ceil(c.getBoundingClientRect().height);
      $('.bk2-c .bc-t', books[i]).style.setProperty('font-size', titleSize + 'px', 'important');
      $('.bk2-c .bc-p', books[i]).style.setProperty('font-size', subSize + 'px', 'important');
      books[i].removeChild(c);
    });
  }

  function size() {
    books.forEach(x => { x.style.height = ''; });
    row.style.height = '';
    if (current) {
      const h = heights[books.indexOf(current)];
      current.style.height = h + 'px';
      row.style.height = (h + 10) + 'px';
    }
  }

  function set(book) {
    current = book;
    books.forEach(x => {
      const on = x === book;
      x.classList.toggle('on', on);
      $('.bk2-sp', x).setAttribute('aria-expanded', on);
    });
    shelf.classList.toggle('open', !!book);
    size();
  }

  books.forEach(b => {
    $('.bk2-sp', b).addEventListener('click', () => set(b));
    $('.bk2-c', b).addEventListener('click', () => set(null));
  });
  const remeasure = () => { measure(); size(); };
  remeasure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(remeasure, 120); });
  shelf._open = i => set(books[i]);
}

export function initBookshelf() {
  $$('.nsel2').forEach(initShelf);
}

/* Cover rows elsewhere: shrink titles so the longest one fits, same size across a row. */
export function initCoverFit() {
  const fit = () => $$('.cov-row').forEach(g => {
    const titles = $$('.bc-t', g);
    titles.forEach(t => t.style.removeProperty('font-size'));
    let k = 1;
    titles.forEach(t => {
      if (t.offsetParent && t.closest('.bc').clientWidth > 150 && t.scrollWidth > t.clientWidth + 1) k = Math.min(k, t.clientWidth / t.scrollWidth);
    });
    if (k < 1) titles.forEach(t => t.style.setProperty('font-size', (parseFloat(getComputedStyle(t).fontSize) * k * 0.98) + 'px', 'important'));
  });
  fit();
  if (document.fonts) document.fonts.ready.then(fit);
  addEventListener('resize', fit);
  document.addEventListener('click', () => setTimeout(fit, 500));
}
