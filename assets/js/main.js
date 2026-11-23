// Site entry point. Loaded on every page as <script type="module">, so it runs after the
// HTML is parsed. Each feature checks for its own elements and does nothing when they are
// missing, so one file serves all four pages. The order below matches the original script.
import { run } from './lib/dom.js';
import { legacyRedirect, initNav, landOnSection } from './features/nav.js';
import { initMaturity } from './features/maturity.js';
import { initEstimator } from './features/estimator.js';
import { initTools } from './features/tools.js';
import { initCustomSelects } from './features/custom-select.js';
import { initDialogs } from './features/dialogs.js';
import { initDashboard } from './features/dashboard.js';
import { initDecks } from './features/deck.js';
import { initTabs, initTabKeys } from './features/tabs.js';
import { initCopyEmail, initContactForm } from './features/contact.js';
import { initSkills } from './features/skills.js';
import { initGroundReveal, initHoursInfo, initDeliverableCtas, initSectorPills, initLeadership, initCaseRowDots, initSectorArrows } from './features/home-widgets.js';
import { initCycle, initCycleList } from './features/cycle.js';
import { initQuotes } from './features/quotes.js';
import { initBookshelf, initCoverFit } from './features/bookshelf.js';

if (!legacyRedirect()) {
  run('maturity tool', initMaturity);
  run('estimator', initEstimator);
  run('tool panels', initTools);
  run('custom selects', initCustomSelects);
  run('dialogs', initDialogs);
  run('dashboard sample', initDashboard);
  run('slide decks', initDecks);
  run('tabs', initTabs);
  run('navigation', initNav);
  run('copy email', initCopyEmail);
  run('contact form', initContactForm);
  run('skills', initSkills);
  // An empty touchstart listener lets iOS Safari apply :active styles on tap.
  run('touch active states', () => document.addEventListener('touchstart', () => {}, { passive: true }));
  run('ground reveal', initGroundReveal);
  run('hours info', initHoursInfo);
  run('deliverable CTAs', initDeliverableCtas);
  run('cycle', initCycle);
  run('quotes', initQuotes);
  run('sector pills', initSectorPills);
  run('cycle step list', initCycleList);
  run('bookshelf', initBookshelf);
  run('cover fit', initCoverFit);
  run('case row dots', initCaseRowDots);
  run('sector arrows', initSectorArrows);
  run('leadership', initLeadership);
  run('tab keys', initTabKeys);
  // Last, so every widget above the section has its final height.
  run('land on section', landOnSection);
}
