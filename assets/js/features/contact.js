// Contact: the envelope form on /contact/ (posts to Formspree) and the footer copy-email button.
import { $, $$ } from '../lib/dom.js';

const EMAIL = 'gab.rodier@gmail.com';

export function initCopyEmail() {
  const btn = document.getElementById('copy'), status = document.getElementById('copied');
  if (!btn) return;
  btn.addEventListener('click', () => {
    // Fallback when the clipboard API is blocked: select the address so it can be copied by hand.
    const select = () => {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('email'));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = 'Selected';
    };
    try {
      navigator.clipboard.writeText(EMAIL).then(() => { status.textContent = 'Copied'; }, select);
    } catch (e) {
      select();
    }
  });
}

export function initContactForm() {
  const stage = $('#write .env-stage');
  if (!stage) return;
  const form = $('.cform', stage), sealText = $('.seal-t', stage);

  // While the envelope is closed the form is invisible, so keep it out of the Tab order
  // and away from screen readers too.
  const syncInert = () => { form.inert = stage.dataset.state !== 'open'; };
  new MutationObserver(syncInert).observe(stage, { attributes: true, attributeFilter: ['data-state'] });
  syncInert();

  $('.seal', stage).addEventListener('click', () => {
    if (stage.dataset.state !== 'closed' && stage.dataset.state !== 'sealed') return;
    form.reset();
    sealText.textContent = 'Open';
    stage.dataset.state = 'open';
    setTimeout(() => { const first = $('input', form); if (first) first.focus({ preventScroll: true }); }, 1300);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const missing = [];
    $$('[required]', form).forEach(x => {
      const ok = x.value.trim() && (x.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.value));
      x.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) missing.push(x.name);
    });
    const error = $('.ferr', form);
    if (missing.length) { error.textContent = `Please fill in: ${missing.join(', ')}.`; return; }
    error.textContent = '';

    const send = $('.send', form), label = send.innerHTML;
    if (send.disabled) return;
    send.disabled = true;
    send.setAttribute('aria-busy', 'true');
    send.innerHTML = 'Sending&hellip;';
    const done = () => { send.disabled = false; send.removeAttribute('aria-busy'); send.innerHTML = label; };

    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(r => {
        if (r.ok) {
          done();
          $('.ty-n', stage).textContent = $('[name=name]', form).value.trim().split(' ')[0];
          stage.dataset.state = 'thanks';
          setTimeout(() => { stage.dataset.state = 'sealed'; sealText.textContent = 'Sent'; }, 2600);
          return;
        }
        return r.json().catch(() => ({})).then(d => {
          done();
          const msg = d && d.errors && d.errors.map(x => x.message).join(' ');
          error.textContent = (msg ? msg + ' ' : '') + 'Your note didn’t send. Please try again, or email me directly using the address in the footer.';
        });
      })
      .catch(() => {
        done();
        error.textContent = 'Your note didn’t send (connection problem). Please try again, or email me directly using the address in the footer.';
      });
  });

  $('.replay', stage).addEventListener('click', () => { stage.dataset.state = 'closed'; sealText.textContent = 'Open'; });
}
