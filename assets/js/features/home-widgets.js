// Smaller homepage widgets: ground reveal, AI-hours info popups, deliverable CTA hover,
// sector pills, leadership tap-to-open (phones), and the scroll dots under case card rows.
import { $, $$, ensureId } from '../lib/dom.js';

/* Maturity "ground" illustrations grow in when scrolled into view. */
export function initGroundReveal() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('main .ground').forEach(g => {
    g.classList.add('pre');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) requestAnimationFrame(() => g.classList.remove('pre'));
      else if (e.boundingClientRect.top > 0) g.classList.add('pre');
    }), { threshold: [0, .4] });
    io.observe(g);
  });
}

/* AI section "hours saved" info buttons: tap/click toggles the popup. */
export function initHoursInfo() {
  const buttons = $$('.rv-info');
  const closeAll = except => buttons.forEach(b => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  buttons.forEach(b => {
    // The popup text lives inside the button, but the button's aria-label would hide it from
    // screen readers. Point the button at it as a description so it is read out.
    const pop = $('.rv-pop', b);
    if (pop) b.setAttribute('aria-describedby', ensureId(pop, 'rv-pop'));
    b.addEventListener('click', e => {
      e.stopPropagation();
      const wasOpen = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    });
  });
  document.addEventListener('click', () => closeAll(null));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(null); });
}

/* "See Deliverable Examples" cards reveal their description on hover/focus (not on touch). */
export function initDeliverableCtas() {
  $$('.xcta').forEach(a => {
    const show = () => a.classList.add('is-open'), hide = () => a.classList.remove('is-open');
    a.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') show(); });
    a.addEventListener('pointerleave', hide);
    a.addEventListener('mouseenter', show);
    a.addEventListener('mouseleave', hide);
    a.addEventListener('focus', show);
    a.addEventListener('blur', hide);
  });
}

/* Sector pills (Tech + Media, ...): one panel at a time, with a pointer under the active pill. */
export function initSectorPills() {
  $$('.t1b').forEach(x => {
    const tabs = $$('.t1-b', x), panels = $$('.t1b-p', x), box = $('.t1b-box', x);
    const select = (b, i) => {
      tabs.forEach(y => y.setAttribute('aria-selected', y === b));
      panels.forEach((p, j) => { p.hidden = j !== i; p.classList.toggle('on', j === i); });
      box.style.setProperty('--cx', (b.offsetLeft - box.offsetLeft + b.offsetWidth / 2) + 'px');
    };
    tabs.forEach((b, i) => b.addEventListener('click', () => select(b, i)));
    select(tabs[0], 0);
    window.addEventListener('resize', () => {
      const active = $('.t1-b[aria-selected=true]', x);
      select(active, tabs.indexOf(active));
    });
  });
}

/* Leadership practices: on phones each card is a tap-to-open toggle (desktop shows everything). */
export function initLeadership() {
  $$('.lx2 .lxc').forEach((card, i) => {
    const title = $('b', card);
    if (!title) return;
    title.classList.add('lx-b');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lx-t';
    toggle.textContent = title.textContent;
    toggle.setAttribute('aria-expanded', 'false');
    const body = $('p', card);
    if (body) { body.id = 'lxp' + i; toggle.setAttribute('aria-controls', 'lxp' + i); }
    title.parentNode.insertBefore(toggle, title);
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', card.classList.toggle('open')));
  });

  // Sector pills scroll sideways on phones: keep the selected pill in view.
  $$('.t1c .t1-b').forEach(b => b.addEventListener('click', () => {
    const row = b.parentNode;
    row.scrollTo({ left: b.offsetLeft - row.offsetLeft - 16 - (row.clientWidth - b.offsetWidth) / 2 + 16, behavior: 'smooth' });
  }));
}

/* Case card rows scroll sideways on phones: decorative dots show the position. */
export function initCaseRowDots() {
  $$('.ocases').forEach(row => {
    const items = Array.from(row.children);
    if (items.length < 2) return;
    const dots = document.createElement('div');
    dots.className = 'oc-dots';
    dots.setAttribute('aria-hidden', 'true');
    items.forEach(card => {
      const b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.addEventListener('click', () => row.scrollTo({ left: card.offsetLeft - row.offsetLeft - 16, behavior: 'smooth' }));
      dots.appendChild(b);
    });
    row.parentNode.insertBefore(dots, row.nextSibling);
    const update = () => {
      const x = row.scrollLeft;
      let k = 0, best = 1e9;
      items.forEach((c, i) => { const v = Math.abs(c.offsetLeft - row.offsetLeft - 16 - x); if (v < best) { best = v; k = i; } });
      if (x >= row.scrollWidth - row.clientWidth - 4) k = items.length - 1;
      Array.from(dots.children).forEach((b, i) => b.classList.toggle('on', i === k));
    };
    let raf;
    row.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); });
    addEventListener('resize', update);
    update();
  });
}
