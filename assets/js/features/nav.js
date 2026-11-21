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

export function initNav() {
  initMenu();
  initScrollSpy();
  initBackToTop();
  markCurrentPage();
}
