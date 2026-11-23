/*
 * dataLayer tracking for the portfolio.
 *
 * The contract is reference/tracking-specs.csv ("Dev Requirements (DL Specs)" column) and
 * reference/parameter-list.csv. This is a classic script loaded in <head> before the GTM
 * snippet, so `initialize_dataLayer` is the first push GTM sees on every page.
 *
 * Rules kept here:
 * - Every push goes through push(), which sends every parameter the event defines and sets
 *   any missing value to undefined (never null, "" or "n/a").
 * - No visitor PII: form field values are never read, and search terms that look like an
 *   email, phone number or long run of digits are replaced with OMITTED.
 * - Gabrielle's email address is never pushed; "gab.rodier address" is used instead.
 * - Global Privacy Control is honored inside GTM, not here.
 * - ?dl_debug=1 logs every push to the console (remembered for the tab; ?dl_debug=0 stops it).
 * - ?internal=1 marks this browser as internal traffic until a visit with ?internal=0.
 */
(function () {
  'use strict';

  var w = window, d = document;
  var dataLayer = (w.dataLayer = w.dataLayer || []);

  var OMITTED = '*Omitted!* user PII suspected';
  var EMAIL_LABEL = 'gab.rodier address';

  /* ---------- parameters each event sends (order matches the spec) ---------- */
  var PAGE_KEYS = ['page_url', 'page_title', 'query_parameter', 'page_type', 'page_section_path', 'page_section_title'];
  var NAV_KEYS = ['click_text', 'click_url', 'element_type', 'element_location'];
  var EVENTS = {
    initialize_dataLayer: PAGE_KEYS.concat('internal_traffic'),
    section_view: PAGE_KEYS,
    scroll: ['page_percentage'],
    external_link_click: ['click_text', 'click_url', 'click_domain'],
    form_view: ['element_name', 'element_id', 'click_text'],
    form_submit: ['click_text', 'element_name', 'element_id', 'form_selection'],
    failed_form_attempt: ['click_text', 'element_name', 'element_id', 'element_type'],
    main_nav_click: NAV_KEYS,
    footer_nav_click: NAV_KEYS,
    file_download: ['file_name', 'file_extension', 'click_url', 'click_text', 'element_location'],
    click_to_email: ['click_text', 'element_location'],
    copy_link_click: ['click_text', 'element_location', 'element_name'],
    tool_interaction: ['element_type', 'element_location', 'element_name', 'click_text'],
    modal_open: ['click_text', 'element_name', 'element_type'],
    modal_close: ['element_name', 'element_type'],
    expandable_content_click: ['click_text', 'element_location'],
    content_slider_interaction: ['action', 'click_direction', 'element_location', 'from_state', 'to_state', 'total_options'],
    hamburger_nav_open: [],
    filter_interaction: ['element_location', 'element_name', 'element_type', 'filter_selection', 'results_count', 'total_options', 'secondary_filter_applied', 'search_filter_applied'],
    cta_click: ['click_text', 'element_location'],
    back_to_top_click: ['page_percentage'],
    info_hover: ['element_name', 'element_location', 'element_type']
  };

  /* ---------- storage + URL flags ---------- */
  var params = new URLSearchParams(location.search);

  function flag(storage, key, param) {
    var v = params.get(param);
    try {
      if (v === '1') storage.setItem(key, '1');
      else if (v === '0') storage.removeItem(key);
      return storage.getItem(key) === '1';
    } catch (e) {
      return v === '1';
    }
  }
  var debug = flag(safeStorage('sessionStorage'), 'gr_dl_debug', 'dl_debug');
  var internal = flag(safeStorage('localStorage'), 'gr_internal', 'internal');

  function safeStorage(name) {
    try { return w[name]; } catch (e) { return null; }
  }

  /* ---------- the one push helper ---------- */
  function push(event, data) {
    var keys = EVENTS[event], o = { event: event };
    if (!keys) return;
    data = data || {};
    keys.forEach(function (k) {
      var v = data[k];
      o[k] = v === null || v === '' || v === undefined || (typeof v === 'number' && isNaN(v)) ? undefined : v;
    });
    dataLayer.push(o);
    if (debug && w.console) console.log('[dataLayer]', o);
  }

  /* ---------- small helpers ---------- */
  var EMAIL_RE = /[^\s@/?&=#]+@[^\s@/?&=#]+\.[^\s@/?&=#]+/g;

  function looksLikePII(s) {
    var digits = (s.match(/\d/g) || []).length;
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(s) ||            // email
      /\d{6,}/.test(s.replace(/[\s.()-]/g, '')) && digits >= 6 || // long run of digits / phone
      /^\+?[\d\s().-]{7,}$/.test(s);                       // phone-shaped
  }

  function decode(s) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }

  // Replace anything email-shaped in a URL or query string.
  function scrub(s) {
    var plain = decode(s);
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(plain) ? plain.replace(EMAIL_RE, '[email omitted]') : s;
  }

  // "gab-rodier.github.io/portfolio/contact/" style (the spec's nav and link examples).
  function bareUrl(u) {
    return scrub(u.host + u.pathname + u.search + u.hash);
  }

  // Visible desktop label: drops icons, arrows, the phone-only short label, and helper text.
  function label(el) {
    if (!el) return undefined;
    var c = el.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('[aria-hidden="true"],svg,.l-short,.xc-m,.hg-n,.tt-close'), function (x) { x.remove(); });
    var t = c.textContent.replace(/[←→]/g, '').replace(/\s+/g, ' ').trim();
    if (!t) t = (el.getAttribute('aria-label') || '').trim();
    return t || undefined;
  }

  var ACRONYMS = { QA: 1, AI: 1, UX: 1, KPI: 1, CRO: 1 };
  function titleCase(s) {
    return s.trim().toLowerCase().split(/\s+/).map(function (word) {
      var up = word.toUpperCase();
      return ACRONYMS[up] ? up : word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  function pct() {
    var h = d.documentElement.scrollHeight;
    return Math.min(100, Math.round((w.scrollY + w.innerHeight) / h * 100));
  }

  // Run fn once the site's own handlers for this event have updated the page: on the way back
  // up at window, or on the next tick for events that don't get there.
  function after(e, fn) {
    var done = false;
    var run = function () {
      if (done) return;
      done = true;
      w.removeEventListener(e.type, run);
      fn();
    };
    w.addEventListener(e.type, run);
    setTimeout(run, 0);
  }

  // While a "Reset to Sample" / "Clear All" / "Reset filters" click replays other controls,
  // those replayed clicks, changes and inputs are not separate visitor actions.
  var bulk = false;
  function startBulk() { bulk = true; setTimeout(function () { bulk = false; }, 0); }

  /* ---------- page context ---------- */
  var PAGES = {
    home: ['Homepage', 'home'],
    samples: ['Work Samples', 'work samples'],
    skills: ['Skills + Tools', 'skills + tools'],
    write: ['Contact', 'contact']
  };
  var path = location.pathname;
  var page = /\/work-samples\/(index\.html)?$/.test(path) ? 'samples'
    : /\/skills-tools\/(index\.html)?$/.test(path) ? 'skills'
      : /\/contact\/(index\.html)?$/.test(path) ? 'write' : 'home';
  var HOME_SECTIONS = ['analytics', 'ai', 'operations', 'leadership', 'about'];

  function query() {
    var q = new URLSearchParams(location.search);
    q.delete('internal');
    q.delete('dl_debug');
    var s = q.toString();
    return s ? scrub(s) : undefined;
  }

  function pageInfo(sectionId) {
    return {
      page_url: scrub(location.href),
      page_title: PAGES[page][0],
      query_parameter: query(),
      page_type: PAGES[page][1],
      page_section_path: sectionId ? '#' + sectionId : undefined,
      page_section_title: sectionId || undefined
    };
  }

  // Old one-page links (#samples, #skills, #write) redirect before anything renders; the
  // page they land on sends its own initialize_dataLayer.
  if (page === 'home' && /^#(samples|skills|write)$/.test(location.hash)) return;

  var initial = pageInfo(page === 'home' && HOME_SECTIONS.indexOf(location.hash.slice(1)) > -1 ? location.hash.slice(1) : null);
  initial.internal_traffic = internal ? 'true' : 'false';
  push('initialize_dataLayer', initial);

  /* ---------- names and locations ---------- */
  var SECTION_NAMES = {
    top: 'Homepage hero', analytics: 'Analytics section', ai: 'AI section', operations: 'Operations section',
    leadership: 'Leadership section', about: 'About section',
    samples: 'Work Samples page', skills: 'Skills + Tools page', write: 'Contact page'
  };
  var DIALOG_CTA_NAMES = { 'cs-maturity': 'Maturity Framework case study', 'cs-scoping': 'Scoping System case study' };
  var TOOLS = { assess: 'Maturity Framework Tool', estimator: 'Scoping Tool' };
  var TOOL_LOCATIONS = { assess: 'Maturity Tool', estimator: 'Scoping Tool' };

  function cardTitle(id) {
    var h = d.querySelector('[data-open="' + id + '"] h3');
    return h ? h.textContent.trim() : id;
  }
  function modal(dlg) {
    var cs = dlg.id.indexOf('cs-') === 0;
    return { element_name: cardTitle(dlg.id) + (cs ? ' Case Study' : ' Work Sample'), element_type: cs ? 'Case Study' : 'Work Sample' };
  }
  function sampleLocation(el) {
    var dlg = el.closest('dialog');
    return dlg ? cardTitle(dlg.id) + ' work sample' : undefined;
  }
  function placeName(el) {
    var dlg = el.closest('dialog');
    if (dlg) return DIALOG_CTA_NAMES[dlg.id] || modal(dlg).element_name;
    if (el.closest('footer')) return 'Footer';
    var s = el.closest('section[id]');
    return s ? SECTION_NAMES[s.id] : undefined;
  }
  // file_download and click_to_email use lowercase places ("footer", "contact page").
  function placeLower(el) {
    var p = placeName(el);
    return p ? p.toLowerCase() : undefined;
  }

  /* ---------- links: specific event, then one location event ---------- */
  function onLink(a) {
    if (a.hasAttribute('data-open')) return onModalOpener(a);

    var href = a.getAttribute('href') || '';
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return; }
    var mail = url.protocol === 'mailto:';
    var text = label(a);
    if (text && text.indexOf('@') > -1) text = EMAIL_LABEL;
    var external = /^https?:$/.test(url.protocol) && url.host !== location.host;
    var file = a.hasAttribute('download') || /\.pdf$/i.test(url.pathname);

    // Specific events
    if (mail) {
      push('click_to_email', { click_text: text, element_location: placeLower(a) });
    } else if (file) {
      var name = decode(url.pathname.split('/').pop());
      push('file_download', {
        file_name: name.replace(/\.[^.]+$/, ''),
        file_extension: (name.split('.').pop() || '').toUpperCase(),
        click_url: url.href,
        click_text: text,
        element_location: placeLower(a)
      });
    } else if (external) {
      push('external_link_click', { click_text: text, click_url: bareUrl(url), click_domain: url.hostname.replace(/^www\./, '') });
    }

    // Location events (exactly one)
    var clickUrl = mail ? EMAIL_LABEL : bareUrl(url);
    if (a.closest('header .nav')) {
      var brand = a.classList.contains('brand');
      push('main_nav_click', {
        click_text: brand ? 'logo icon' : text, click_url: clickUrl,
        element_type: brand ? 'icon' : a.classList.contains('btn') ? 'button' : 'link', element_location: 'static'
      });
    } else if (a.closest('#takeover')) {
      // The menu's logo goes home (like the footer logo); Get in Touch is styled as a button.
      var menuLogo = a.classList.contains('to-home');
      push('main_nav_click', {
        click_text: menuLogo ? 'logo icon' : text, click_url: clickUrl,
        element_type: menuLogo ? 'icon' : a.classList.contains('to-btn') ? 'button' : 'link', element_location: 'hamburger'
      });
    } else if (a.closest('footer')) {
      var logo = a.classList.contains('fbrand');
      push('footer_nav_click', {
        click_text: logo ? 'logo icon' : text, click_url: clickUrl,
        element_type: logo ? 'icon' : a.classList.contains('cc-a') ? 'button' : 'link',
        element_location: logo ? 'logo' : a.closest('.ccard') ? 'Get in Touch' : a.closest('.fx') ? 'Explore' : undefined
      });
    } else if (a.matches('.btn, .xcta')) {
      push('cta_click', { click_text: text, element_location: placeName(a) });
      // "Try the Self-Assessment" / "Try the Estimator" also open the tool they point at.
      var tool = /^#(assess|estimator)$/.test(href) && d.getElementById(href.slice(1));
      if (tool && tool.classList.contains('collapsed')) {
        push('modal_open', { click_text: text, element_name: TOOLS[tool.id], element_type: 'Tool' });
      }
    }
  }

  function onModalOpener(a) {
    var dlg = d.getElementById(a.getAttribute('data-open'));
    if (!dlg) return;
    // The card's "Read the case" / "Open the dashboard" line, not the whole card text.
    var cta = Array.prototype.filter.call(a.querySelectorAll('*'), function (x) {
      var s = x.textContent.trim();
      return s.length < 40 && /^(read|view|open)\b/i.test(s);
    }).pop();
    var m = modal(dlg);
    push('modal_open', { click_text: label(cta || a), element_name: m.element_name, element_type: m.element_type });
  }

  /* ---------- sliders: review quotes and work sample decks ---------- */
  // Reads "3 / 11" (decks) or "01–02 / 04" (quotes) into { from: "1-2", index: 1, total: "4" }.
  function sliderState(root) {
    var c = root.querySelector('.deck-count, .qc-cnt');
    var m = c && c.textContent.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*\/\s*(\d+)/);
    if (!m) return null;
    var a = +m[1], b = m[2] ? +m[2] : null;
    return { state: b ? a + '-' + b : String(a), index: a, total: String(+m[3]) };
  }
  function sliderRoot(el) { return el.closest('.qcar3') || el.closest('dialog'); }
  function sliderName(root) { return root.classList.contains('qcar3') ? 'review feedback quotes' : sampleLocation(root); }

  // e: the event that moves the slider. delay: wait this long instead (swipes settle late).
  function trackSlide(root, action, direction, e, delay) {
    var before = root && sliderState(root);
    if (!before) return;
    var check = function () {
      var now = sliderState(root);
      if (!now || now.state === before.state) return;
      push('content_slider_interaction', {
        action: action,
        click_direction: direction || (now.index > before.index ? 'forward' : 'backward'),
        element_location: sliderName(root),
        from_state: before.state,
        to_state: now.state,
        total_options: now.total
      });
    };
    if (delay) setTimeout(check, delay);
    else after(e, check);
  }

  /* ---------- card rows that scroll sideways on narrow screens ---------- */
  // The arrows and dots under the case study and work sample card rows. The active dot is
  // the position: { state: "2", index: 2, total: "3" }.
  function rowState(nav) {
    var pips = nav ? nav.querySelectorAll('.oc-pips button') : [];
    var on = Array.prototype.findIndex.call(pips, function (b) { return b.classList.contains('on'); });
    return on < 0 ? null : { state: String(on + 1), index: on + 1, total: String(pips.length) };
  }
  function rowName(nav) {
    var s = nav.closest('#samples, #operations, #analytics');
    return !s ? undefined : s.id === 'samples' ? 'work sample cards' : s.id === 'operations' ? 'Operations case studies' : 'Analytics case studies';
  }
  // The row scrolls smoothly, so read the new position once it has settled.
  function trackRow(el, action, direction) {
    var nav = el.closest('.oc-dots'), before = rowState(nav);
    if (!before) return;
    setTimeout(function () {
      var now = rowState(nav);
      if (!now || now.state === before.state) return;
      push('content_slider_interaction', {
        action: action,
        click_direction: direction || (now.index > before.index ? 'forward' : 'backward'),
        element_location: rowName(nav),
        from_state: before.state,
        to_state: now.state,
        total_options: now.total
      });
    }, 900);
  }

  /* ---------- tools (maturity + scoping) ---------- */
  function toolPush(type, toolId, name, text) {
    push('tool_interaction', { element_type: type, element_location: TOOL_LOCATIONS[toolId], element_name: name, click_text: text });
  }

  /* ---------- filters ---------- */
  function skillsState() {
    var view = d.getElementById('skills');
    var pressed = function (attr) { var b = view.querySelector('[' + attr + '][aria-pressed="true"]'); return b && b.getAttribute(attr) !== 'all' ? label(b) : null; };
    var m = (view.querySelector('.hb-count') || {}).textContent;
    m = m && m.match(/(\d+)\s+of\s+(\d+)/);
    var input = d.getElementById('hb-q'), term = input ? input.value.trim() : '';
    return {
      area: pressed('data-fa'), level: pressed('data-fl'),
      term: term ? (looksLikePII(term) ? OMITTED : term.slice(0, 100)) : null,
      results: m ? m[1] : undefined, total: m ? m[2] : undefined
    };
  }
  function skillsPush(name, type, selection, s, extra) {
    var others = [];
    if (s.area && name !== 'Area') others.push('Area: ' + s.area);
    if (s.level && name !== 'Level') others.push('Level: ' + s.level);
    push('filter_interaction', {
      element_location: 'Skills + Tools', element_name: name, element_type: type, filter_selection: selection,
      results_count: s.results, total_options: s.total,
      secondary_filter_applied: extra === 'reset' ? undefined : others.join(', '),
      search_filter_applied: name === 'Search Term' || extra === 'reset' ? undefined : s.term
    });
  }

  var searchTimer = 0;
  function onSearchInput(input) {
    clearTimeout(searchTimer);
    if (bulk || !input.value.trim()) return;
    searchTimer = setTimeout(function () {
      var s = skillsState();
      if (s.term) skillsPush('Search Term', 'search bar', s.term, s);
    }, 2000);
  }

  function dashSecondary(except) {
    var parts = [];
    ['dash-host', 'dash-range'].forEach(function (id) {
      var sel = d.getElementById(id);
      if (!sel || id === except || sel.selectedIndex <= 0) return;
      parts.push(fieldName(sel) + ': ' + sel.options[sel.selectedIndex].text);
    });
    return parts.join(', ');
  }
  function fieldName(sel) {
    var l = sel.closest('label'), s = l && l.querySelector('span');
    return s ? s.textContent.trim() : sel.id;
  }

  /* ---------- clicks (capture phase, so "before" state is still readable) ---------- */
  var picked = new WeakMap(); // native <select> -> selectedIndex before a custom-dropdown pick
  var pointerType = null;
  d.addEventListener('pointerdown', function (e) { pointerType = e.pointerType; }, true);
  d.addEventListener('keydown', function () { pointerType = null; }, true);

  d.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element) || bulk) return;
    var el;

    // Custom dropdown option: remember the choice it replaces, so picking the option that is
    // already selected doesn't count as a change (see the change listener).
    if ((el = t.closest('.csel .cs-list li'))) {
      var native = el.closest('.csel').querySelector('select');
      if (native) picked.set(native, native.selectedIndex);
      return;
    }

    // Links (nav, footer, CTAs, downloads, email, external, case/sample openers)
    if ((el = t.closest('a[href]'))) return onLink(el);

    // Phone menu: opening it sends hamburger_nav_open only; closing it sends nothing.
    // (main_nav_click is for the menu's links, handled in onLink.)
    if (t.closest('.menu-btn')) return push('hamburger_nav_open');
    if (t.closest('#takeover .to-close')) return;

    // Footer copy + back to top
    if ((el = t.closest('#copy'))) {
      return push('copy_link_click', { click_text: label(el), element_location: 'footer', element_name: EMAIL_LABEL });
    }
    if (t.closest('.totop')) return push('back_to_top_click', { page_percentage: pct() });

    // Contact envelope
    if ((el = t.closest('#write .seal'))) {
      var stage = el.closest('.env-stage'), form = stage.querySelector('form');
      if (stage.dataset.state === 'closed' || stage.dataset.state === 'sealed') {
        push('form_view', { element_name: 'contact form', element_id: form.id, click_text: (stage.querySelector('.seal-t') || {}).textContent || 'Open' });
      }
      return;
    }

    // Tool panels open/close
    if ((el = t.closest('.tool-toggle'))) {
      var tool = el.closest('.tool');
      if (!TOOLS[tool.id]) return;
      if (tool.classList.contains('collapsed')) {
        push('modal_open', { click_text: label(el.querySelector('.tt-open') || el), element_name: TOOLS[tool.id], element_type: 'Tool' });
      } else {
        push('modal_close', { element_name: TOOLS[tool.id], element_type: 'Tool' });
      }
      return;
    }

    // Maturity tool result
    if ((el = t.closest('#quiz-go'))) return toolPush('submit for result', 'assess', undefined, label(el));

    // Scoping tool: wide-span updates and multi-choice buttons
    if ((el = t.closest('#estimator [data-tasks]'))) {
      toolPush('selections wide-span update', 'estimator', undefined, label(el));
      return startBulk();
    }
    if ((el = t.closest('#estimator .seg-ctl button'))) {
      if (el.getAttribute('aria-pressed') === 'true') return; // already selected: nothing changes
      var seg = el.closest('.seg-ctl'), prev = seg.previousElementSibling;
      return toolPush('multi-choice button selection', 'estimator', prev ? prev.textContent.trim() : undefined, label(el));
    }

    // Sliders
    if ((el = t.closest('.qc-prev, .qc-next, .deck-btn'))) {
      var back = el.matches('.qc-prev') || el.getAttribute('data-dir') === '-1';
      // The quote track's arrow keys call .click() on these buttons (an untrusted click).
      return trackSlide(sliderRoot(el), e.isTrusted ? 'shift arrow click' : 'arrow key', back ? 'backward' : 'forward', e);
    }
    if ((el = t.closest('.qc-seg, .qc-dot, .wdot'))) return trackSlide(sliderRoot(el), 'shift bar click', null, e);
    if ((el = t.closest('.oc-arr'))) return trackRow(el, 'shift arrow click', el.classList.contains('prev') ? 'backward' : 'forward');
    if ((el = t.closest('.oc-pips button'))) return trackRow(el, 'shift bar click');

    // Expandable content
    if ((el = t.closest('.rf-hit, .rw2 .rl button, .rf-prev, .rf-next'))) {
      // A click on the step list replays a click on the ring; count the visitor's click only.
      if (el.matches('.rf-hit') && !e.isTrusted) return;
      return trackCycle(el, e);
    }
    if ((el = t.closest('.sh-tabs [role=tab], .dash-tabs [role=tab]'))) {
      if (el.getAttribute('aria-selected') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: sampleLocation(el) });
      return;
    }
    if ((el = t.closest('.folder'))) {
      if (el.getAttribute('aria-selected') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: 'Toolkit Highlights' });
      return;
    }
    if ((el = t.closest('.bk2-sp'))) {
      if (el.getAttribute('aria-expanded') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: 'Off the Clock' });
      return;
    }
    if ((el = t.closest('.t1-b'))) {
      if (el.getAttribute('aria-selected') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: 'Range of Experience' });
      return;
    }
    if ((el = t.closest('.hg-tg'))) {
      if (el.getAttribute('aria-expanded') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: 'Skills + Tools' });
      return;
    }
    if ((el = t.closest('.lx-t'))) {
      if (el.getAttribute('aria-expanded') !== 'true') push('expandable_content_click', { click_text: label(el), element_location: 'Leadership section' });
      return;
    }

    // Skills filters
    if ((el = t.closest('#skills [data-fa], #skills [data-fl]'))) {
      if (el.getAttribute('aria-pressed') === 'true') return; // already selected: nothing changes
      var name = el.hasAttribute('data-fa') ? 'Area' : 'Level', text = label(el);
      return after(e, function () { skillsPush(name, 'selectable option', text, skillsState()); });
    }
    if ((el = t.closest('#skills .hb-reset'))) {
      clearTimeout(searchTimer);
      startBulk();
      var resetText = label(el);
      return after(e, function () { skillsPush('Reset', 'reset button', resetText, skillsState(), 'reset'); });
    }

    // Dashboard channel/type pills
    if ((el = t.closest('#ws-dash .pill-f'))) {
      var group = el.closest('.tab-filter'), groupName = group && group.querySelector('span');
      var on = el.getAttribute('aria-pressed') !== 'true';
      return push('filter_interaction', {
        element_location: sampleLocation(el), element_name: groupName ? groupName.textContent.trim() : undefined,
        element_type: 'selectable option', filter_selection: label(el) + (on ? ' (on)' : ' (off)'),
        secondary_filter_applied: dashSecondary()
      });
    }

    // AI hours info: on touch screens each tap that opens it counts as one hover.
    if ((el = t.closest('.rv-info'))) {
      if (pointerType === 'touch' && el.getAttribute('aria-expanded') !== 'true') pushHover(el);
      return;
    }
  }, true);

  function cycleStep(root) {
    var hit = root.querySelector('.rf-hit[aria-pressed="true"]');
    var l = hit && hit.getAttribute('aria-label');
    return l ? l.replace(/^Step\s+\d+:\s*/, '') : undefined;
  }
  function trackCycle(el, e) {
    var root = el.closest('.rw2') || el.closest('.rf3');
    if (!root) return;
    var before = cycleStep(root);
    after(e, function () {
      var now = cycleStep(root);
      if (now && now !== before) {
        var h = root.closest('.ux') && root.closest('.ux').querySelector('h3');
        push('expandable_content_click', { click_text: now, element_location: h ? h.textContent.trim() : 'The Cycle of Data to UX' });
      }
    });
  }

  /* ---------- keyboard + swipe paths into sliders and the cycle ---------- */
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var t = e.target;
    if (!(t instanceof Element) || t.closest('[role=tab], input, textarea, select, .cs-list')) return;
    var dlg = t.closest('dialog');
    if (dlg && dlg.querySelector('.deck')) return trackSlide(dlg, 'arrow key', e.key === 'ArrowRight' ? 'forward' : 'backward', e);
    var cycle = t.closest('.rf3');
    if (cycle) trackCycle(cycle, e);
  }, true);

  var swipe = null;
  d.addEventListener('touchstart', function (e) {
    var t = e.target;
    var root = t instanceof Element && (t.closest('.qc-tr') || t.closest('dialog .deck')) ? sliderRoot(t) : null;
    swipe = root ? { root: root, x: e.touches[0].clientX } : null;
  }, { capture: true, passive: true });
  d.addEventListener('touchend', function (e) {
    if (!swipe) return;
    var s = swipe;
    swipe = null;
    if (Math.abs(e.changedTouches[0].clientX - s.x) < 30) return;
    // Quotes scroll natively and settle on a slide shortly after the finger lifts.
    trackSlide(s.root, 'swipe', null, e, s.root.classList.contains('qcar3') ? 700 : 0);
  }, { capture: true, passive: true });

  /* ---------- change + input ---------- */
  d.addEventListener('change', function (e) {
    var t = e.target;
    if (!(t instanceof Element) || bulk) return;
    // Re-picking the option that was already selected changes nothing.
    if (t.tagName === 'SELECT' && picked.has(t)) {
      var was = picked.get(t);
      picked.delete(t);
      if (was === t.selectedIndex) return;
    }
    if (t.matches('#quiz-qs select')) {
      var l = d.querySelector('label[for="' + t.id + '"]');
      return toolPush('dropdown selection', 'assess', l ? l.textContent.split(':')[0].trim() : undefined, 'level ' + (t.selectedIndex + 1));
    }
    if (t.matches('#est-tasks input[type=checkbox]')) {
      // Group name and the checkbox's position inside its group.
      var row = t.closest('.task'), n = 0, g = row;
      while (g && !(g.classList && g.classList.contains('grp'))) { if (g.classList && g.classList.contains('task')) n++; g = g.previousElementSibling; }
      return toolPush('checkbox selection', 'estimator', g ? g.textContent.trim() : undefined, 'checkbox section option ' + n);
    }
    if (t.matches('#dash-host, #dash-range')) {
      return push('filter_interaction', {
        element_location: sampleLocation(t), element_name: fieldName(t), element_type: 'selectable option',
        filter_selection: t.options[t.selectedIndex].text, secondary_filter_applied: dashSecondary(t.id)
      });
    }
  }, true);

  d.addEventListener('input', function (e) {
    if (e.target instanceof Element && e.target.id === 'hb-q') onSearchInput(e.target);
  }, true);

  /* ---------- info hover: 1,500ms on the icon (plus its popup) or a skill row ---------- */
  var HOVER = '.rv-info, #skills .hr';
  var hover = { el: null, timer: 0, pointer: false, focus: false };

  function hoverData(el) {
    if (el.matches('.rv-info')) {
      var item = el.closest('.rv-i'), head = item && item.querySelector('.rv-h');
      var hours = head ? head.firstChild.textContent.replace('~', '').trim() : '';
      var what = item && item.querySelector('.mono') ? titleCase(item.querySelector('.mono').textContent.replace(/^\s*saved on\s+/i, '')) : '';
      var kind = el.querySelector('.rv-pop b');
      return { element_name: (hours + ' ' + what).trim(), element_location: 'AI - Hours Saved', element_type: kind ? titleCase(kind.textContent) : undefined };
    }
    var g = el.closest('.hgroup'), gh = g && g.querySelector('.hg-h h2');
    var tip = el.querySelector('.hb-tip');
    return {
      element_name: label(el.querySelector('.hr-n')),
      element_location: 'Skills + Tools' + (gh ? ' - ' + gh.textContent.trim() : ''),
      element_type: tip && tip.querySelector('span') ? 'Level With Note' : 'Basic Level'
    };
  }
  function pushHover(el) { push('info_hover', hoverData(el)); }

  function hoverStart(el, via) {
    if (hover.el !== el) {
      clearTimeout(hover.timer);
      hover = { el: el, timer: setTimeout(function () { pushHover(el); }, 1500), pointer: false, focus: false };
    }
    hover[via] = true;
  }
  function hoverEnd(el, via) {
    if (hover.el !== el) return;
    hover[via] = false;
    if (!hover.pointer && !hover.focus) { clearTimeout(hover.timer); hover.el = null; }
  }
  function hoverTarget(n) { return n instanceof Element ? n.closest(HOVER) : null; }

  d.addEventListener('pointerover', function (e) {
    var el = hoverTarget(e.target);
    if (el && e.pointerType !== 'touch') hoverStart(el, 'pointer');
  }, true);
  d.addEventListener('pointerout', function (e) {
    var el = hoverTarget(e.target);
    if (el && hoverTarget(e.relatedTarget) !== el) hoverEnd(el, 'pointer');
  }, true);
  d.addEventListener('focusin', function (e) {
    var el = hoverTarget(e.target);
    if (!el) return;
    // A tap on a skill row focuses it and shows its tooltip: count it once, right away.
    if (pointerType === 'touch') { if (el.matches('#skills .hr')) pushHover(el); return; }
    // A mouse click focuses the button the pointer is already hovering; that's the same hover.
    hoverStart(el, 'focus');
  }, true);
  d.addEventListener('focusout', function (e) {
    var el = hoverTarget(e.target);
    if (el && hoverTarget(e.relatedTarget) !== el) hoverEnd(el, 'focus');
  }, true);

  /* ---------- scroll depth ---------- */
  var depths = [25, 50, 75, 90, 100], depthTick = 0;
  function checkDepth() {
    depthTick = 0;
    var p = (w.scrollY + w.innerHeight) / d.documentElement.scrollHeight * 100;
    while (depths.length && p >= depths[0] - (depths[0] === 100 ? 0.5 : 0)) push('scroll', { page_percentage: depths.shift() });
  }
  w.addEventListener('scroll', function () { if (!depthTick && depths.length) depthTick = requestAnimationFrame(checkDepth); }, { passive: true });

  /* ---------- things that need the page's elements ---------- */
  function ready() {
    // Popups closing by any route (close button, Escape, backdrop).
    Array.prototype.forEach.call(d.querySelectorAll('dialog.csd, dialog.wsd'), function (dlg) {
      dlg.addEventListener('close', function () { push('modal_close', modal(dlg)); });
    });

    // Contact form: success shows "thanks" only after Formspree confirms; errors land in .ferr.
    var form = d.querySelector('#write .cform');
    if (form) {
      var stage = form.closest('.env-stage'), err = form.querySelector('.ferr');
      var sendText = label(form.querySelector('.send')) || 'Send Note';
      var base = function () { return { click_text: sendText, element_name: 'contact form', element_id: form.id }; };
      new MutationObserver(function () {
        if (stage.dataset.state !== 'thanks') return;
        var o = base(), reason = form.querySelector('select[name=reason]');
        // The reason is a fixed list of options, not something the visitor typed.
        o.form_selection = reason && reason.value ? 'Reason: ' + reason.options[reason.selectedIndex].text : undefined;
        push('form_submit', o);
      }).observe(stage, { attributes: true, attributeFilter: ['data-state'] });
      if (err) new MutationObserver(function () {
        var msg = err.textContent.trim();
        if (!msg) return;
        var o = base();
        o.element_type = /^Please fill in/.test(msg) ? 'validation error' : /connection problem/.test(msg) ? 'network error' : 'server error';
        push('failed_form_attempt', o);
      }).observe(err, { childList: true, characterData: true, subtree: true });
    }

    // Homepage sections: once per load, after 1s at >= 50% of the section visible
    // (or the section filling >= 50% of the screen, for sections taller than the screen).
    if (page !== 'home') return;
    var pending = HOME_SECTIONS.map(function (id) { return { id: id, el: d.getElementById(id), timer: 0 }; }).filter(function (s) { return s.el; });
    var tick = 0;
    function checkSections() {
      tick = 0;
      var vh = w.innerHeight;
      pending.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        var seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        var ok = r.height > 0 && (seen / r.height >= 0.5 || seen / vh >= 0.5);
        if (ok && !s.timer) {
          s.timer = setTimeout(function () {
            push('section_view', pageInfo(s.id));
            pending = pending.filter(function (x) { return x !== s; });
          }, 1000);
        } else if (!ok && s.timer) {
          clearTimeout(s.timer);
          s.timer = 0;
        }
      });
    }
    var schedule = function () { if (!tick && pending.length) tick = requestAnimationFrame(checkSections); };
    w.addEventListener('scroll', schedule, { passive: true });
    w.addEventListener('resize', schedule);
    w.addEventListener('load', schedule);
    schedule();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
