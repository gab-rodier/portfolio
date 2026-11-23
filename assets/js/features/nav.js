// Site navigation: legacy hash redirects, current-page highlighting, scroll-spy on the
// homepage, the full-screen phone menu, and the back-to-top button.
import { $, $$, reducedMotion } from '../lib/dom.js';

const LEGACY = { samples: 'work-samples/', skills: 'skills-tools/', write: 'contact/' };

/** Old single-page links (#samples, #skills, #write) keep working. Returns true if redirecting. */
export function legacyRedirect() {
  const target = LEGACY[(location.hash || '').slice(1)];
  if (document.body.dataset.page === 'home' && target) {
    location.replace(target);
    return true;
  }
  return false;
}

function markCurrentPage() {
  const page = document.body.dataset.page;
  const here = location.pathname.replace(/index\.html$/, '');
  $$('.links a,.nav-cta .btn').forEach(a => {
    const u = new URL(a.getAttribute('href'), location.href);
    a.toggleAttribute('aria-current', page !== 'home' && !u.hash && u.pathname.replace(/index\.html$/, '') === here);
  });
}

function initMenu() {
  const btn = $('.menu-btn'), menu = document.getElementById('takeover');
  if (!btn || !menu) return;
  const closeBtn = $('.to-close', menu);
  const setOpen = open => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn.focus();
  };
  btn.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => { setOpen(false); btn.focus(); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
  });
}

function initScrollSpy() {
  const sections = ['analytics', 'ai', 'operations', 'leadership', 'about'].map(id => document.getElementById(id));
  const links = $$('.links a');
  const update = () => {
    if (document.body.dataset.page !== 'home') return;
    let current = null;
    const mid = innerHeight * .35;
    sections.forEach(s => { if (s.getBoundingClientRect().top < mid) current = s.id; });
    links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + current));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

function initBackToTop() {
  const btn = $('.totop');
  if (!btn) return;
  const update = () => { btn.dataset.show = scrollY > innerHeight * .9 ? '1' : '0'; };
  addEventListener('scroll', update, { passive: true });
  update();
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }));
}

/* Arriving on the homepage from another page with a section link (../#ai, ../#operations, ...).
   The browser's own jump to the section is a smooth scroll from the top, and on touch screens the
   end of the tap that followed the link can cancel it, leaving the visitor on the hero. On phones the
   widgets above a section also finish building after that jump, so it can stop short. Run last in
   main.js: go straight to the section, then line it up again once images and fonts have loaded,
   unless the visitor has started scrolling themselves. In-page links keep their smooth scroll. */
export function landOnSection() {
  if (document.body.dataset.page !== 'home') return;
  const id = decodeURIComponent((location.hash || '').slice(1));
  const target = id && document.getElementById(id);
  if (!target || target.id === 'top') return;
  let moved = false;
  const stop = () => { moved = true; };
  // Real scrolling only: a leftover tap can send a synthetic mousedown, which must not count.
  ['wheel', 'touchmove', 'keydown'].forEach(t => addEventListener(t, stop, { once: true, passive: true }));
  const land = () => {
    if (moved) return;
    // The section should sit just under the sticky header (html scroll-padding-top).
    const offBy = target.getBoundingClientRect().top - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    if (Math.abs(offBy) > 2) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  land();
  if (document.readyState !== 'complete') addEventListener('load', land, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(land);
  setTimeout(land, 1500);
}

export function initNav() {
  initMenu();
  initScrollSpy();
  initBackToTop();
  markCurrentPage();
}
