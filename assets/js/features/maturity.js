// Maturity self-assessment (homepage Analytics section): five dropdowns -> overall phase.
import { $, $$ } from '../lib/dom.js';

const PHASES = [
  { name: 'Unstructured', question: '"What data?"', steps: ['Audit the current setup so tracking is installed correctly on every page.', 'Add custom event tracking for the handful of actions that matter most.', 'Define a few business objectives and the basic KPIs that map to them.'] },
  { name: 'Descriptive', question: '"What happened?"', steps: ['Build a measurement framework that maps business objectives to user actions.', 'Define primary and secondary KPIs and track them through your tag manager.', 'Stand up a simple automated dashboard for key stakeholders.'] },
  { name: 'Diagnostic', question: '"Why did it happen?"', steps: ['Segment audiences (new vs. returning, location, source) to find performance gaps.', 'Line up site data with campaign timelines and offline data.', 'Find friction points, like high-exit steps in your conversion funnel.'] },
  { name: 'Prescriptive', question: '"What should we do?"', steps: ['Formalize a testing program with a clear hypothesis-to-results process.', 'Run A/B tests on high-impact pages based on diagnostic findings.', 'Use segments to personalize campaigns and on-site experiences.'] },
  { name: 'Predictive', question: '"What might happen next?"', steps: ['Use built-in predictive audiences, like likely purchasers.', 'Connect analytics to a data warehouse to build custom models.', 'Forecast demand to plan budgets and resources ahead of time.'] },
];

const QUESTIONS = [
  { category: 'Data collection', text: 'How would you describe your tracking?', options: ['Default install, not sure it works everywhere', 'Key actions tracked and mostly trustworthy', 'Clean, monitored, combined with other sources', 'Integrated across tools and feeding decisions', 'Unified in a warehouse, ready for modeling'], value: 1 },
  { category: 'Strategic measurement', text: 'Are your KPIs defined?', options: ['Not really', 'A few basic ones', 'Mapped to business objectives', 'Tied to decisions and owned by teams', 'Include forward-looking, predictive KPIs'], value: 1 },
  { category: 'Reporting', text: 'What does reporting look like?', options: ['Ad hoc, if at all', 'A dashboard someone checks', 'Regular reports with segmentation', 'Shared dashboards drive cross-team planning', 'Interactive and predictive dashboards'], value: 2 },
  { category: 'Data application', text: 'What do you do with the data?', options: ['Mostly nothing yet', 'Describe last month', 'Explain why things changed', 'Run tests and change things because of it', 'Act on forecasts before things happen'], value: 1 },
  { category: 'Audience segmentation', text: 'How do you segment audiences?', options: ['One audience for everyone', 'Basic splits like device or source', 'Behavior-based segments, sometimes used', 'Personalization and retargeting in use', 'Predictive segments, like likely to churn'], value: 0 },
];

export function initMaturity() {
  const wrap = document.getElementById('quiz-qs');
  if (!wrap) return;

  QUESTIONS.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'q';
    const id = 'mq' + i;
    row.innerHTML = `<label for="${id}">${q.category}: ${q.text}</label><select id="${id}">` +
      q.options.map((o, j) => `<option value="${j}"${j === q.value ? ' selected' : ''}>${o}</option>`).join('') +
      '</select>';
    wrap.appendChild(row);
    $('select', row).addEventListener('change', () => { document.getElementById('quiz-stale').hidden = false; });
  });

  function score() {
    const vals = QUESTIONS.map((_, i) => +document.getElementById('mq' + i).value);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const level = Math.max(0, Math.min(4, Math.floor(avg + 0.001)));
    const min = Math.min(...vals);
    const weakest = QUESTIONS[vals.indexOf(min)].category;
    const phase = PHASES[level];
    document.getElementById('r-name').textContent = phase.name;
    document.getElementById('r-q').textContent = phase.question;
    $$('#r-meter div').forEach((m, i) => { m.className = i <= level ? 'on' : ''; });
    document.getElementById('r-steps').innerHTML = phase.steps.map(s => `<li>${s}</li>`).join('');
    document.getElementById('r-bott').textContent = min < level
      ? `Your bottleneck: ${weakest.toLowerCase()}. It sits a phase or more behind the rest, and it will cap everything built on top of it.`
      : (level === 4
        ? 'You are operating at the top of the model. The work now is keeping data quality as tight as the models built on it.'
        : 'Your categories are evenly matched. Advance them together rather than jumping ahead in one.');
  }
  score();

  document.getElementById('quiz-go').addEventListener('click', () => {
    score();
    document.getElementById('r-eye').textContent = 'Your overall phase';
    document.getElementById('quiz-stale').hidden = true;
    const result = $('#assess .result');
    result.classList.remove('pop');
    void result.offsetWidth; // restart the pop animation
    result.classList.add('pop');
    if (window.innerWidth < 760) result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
