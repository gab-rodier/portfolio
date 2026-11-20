// "The Cycle of UX Data" (homepage Analytics section): a four-step ring with prev/next,
// plus the step list beside it on wider screens.
import { $, $$ } from '../lib/dom.js';

const STEPS = [
  ['01', 'Find the Friction', 'Analyze digital data - via funnels, heatmaps, segments, and more - to find where users stall'],
  ['02', 'Recommend the Change', 'Propose data-backed UX recommendations with hypotheses & statistical significance estimates'],
  ['03', 'Test or Ship', 'Roll out UX recommendation - either via testing (e.g. A/B, multivariate, etc) or as a measured direct rollout'],
  ['04', 'Measure the Impact', 'Analyze performance to determine the outcome of the update & confirm statistical significance of the outcome'],
];
const SHORT = ['Analyze', 'Suggest', 'Ship', 'Measure'];

function initRing(w) {
  const nodes = $$('.rf-node', w), icons = $$('.rf-ic', w), dots = $$('.rf-dots i', w), hits = $$('.rf-hit', w);
  const dial = $('.rf-dial', w), progress = $('.rf-prog', w);
  let cur = 0;

  // Hit areas sit on the ring; the SVG is drawn on a 420-wide grid.
  const place = () => {
    const r = dial.getBoundingClientRect().width / 420;
    hits.forEach((h, k) => {
      const a = (-90 + 90 * k) * Math.PI / 180;
      h.style.left = (210 + 120 * Math.cos(a)) * r + 'px';
      h.style.top = (180 + 120 * Math.sin(a)) * r + 'px';
    });
  };

  const go = i => {
    cur = (i % 4 + 4) % 4;
    nodes.forEach((x, k) => x.classList.toggle('on', k === cur));
    hits.forEach((h, k) => h.setAttribute('aria-pressed', k === cur ? 'true' : 'false'));
    icons.forEach((x, k) => x.classList.toggle('on', k === cur));
    dots.forEach((x, k) => x.classList.toggle('on', k === cur));
    if (progress) {
      const C = +progress.dataset.c, L = C * cur / 4;
      progress.setAttribute('stroke-dasharray', L.toFixed(1) + ' ' + C.toFixed(1));
    }
    $('.rf-k', w).textContent = `Step ${STEPS[cur][0]} of 04 · ${SHORT[cur]}`;
    $('.rf-t', w).textContent = STEPS[cur][1];
    $('.rf-d', w).textContent = STEPS[cur][2];
  };

  hits.forEach((h, k) => {
    h.addEventListener('click', () => go(k));
    h.addEventListener('mouseenter', () => nodes[k].classList.add('hov'));
    h.addEventListener('mouseleave', () => nodes[k].classList.remove('hov'));
    h.addEventListener('focus', () => nodes[k].classList.add('hov'));
    h.addEventListener('blur', () => nodes[k].classList.remove('hov'));
  });
  $('.rf-prev', w).addEventListener('click', () => go(cur - 1));
  $('.rf-next', w).addEventListener('click', () => go(cur + 1));
  w.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });
  addEventListener('resize', place);
  place();
  go(0);
}

/* The step list mirrors whichever step the ring shows. */
function initStepList(w) {
  const hits = $$('.rf-hit', w), buttons = $$('.rl button', w);
  const sync = () => {
    const k = hits.findIndex(h => h.getAttribute('aria-pressed') === 'true');
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', j === k ? 'true' : 'false'));
  };
  buttons.forEach((b, j) => b.addEventListener('click', () => { hits[j].click(); sync(); }));
  w.addEventListener('click', () => setTimeout(sync, 0));
  w.addEventListener('keydown', () => setTimeout(sync, 0));
  window.addEventListener('load', () => setTimeout(sync, 50));
  sync();
}

export function initCycle() {
  $$('.rf3').forEach(initRing);
}

export function initCycleList() {
  $$('.rw2').forEach(initStepList);
}
