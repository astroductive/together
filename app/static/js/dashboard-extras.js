/* ============================================================================
 * dashboard-extras.js  —  Together dashboard progressive enhancement
 * ----------------------------------------------------------------------------
 * A single CLASSIC script (NOT a module) shared by index.html and index_ar.html.
 * Loaded AFTER the dashboards' main inline script, so it may use the dashboard's
 * global functions and the `window.__dash` live-state bridge.
 *
 * GOLDEN RULE: degrade gracefully. Every DOM lookup and every global access is
 * guarded; a missing element/feature must never throw or block the page. The
 * whole file is wrapped in an IIFE and every feature initialiser has its own
 * try/catch so one failing feature can never break the others.
 *
 * localStorage contracts (must match exactly):
 *   together-analytics      JSON array of {w,c,t,lang,mod}  (c=0..100 int) cap 2000
 *   together-gloss-history  JSON array of {text,t,lang}     cap 50
 *   together-conf-threshold float 0..1  (user confidence filter; 0/absent = off)
 *   together-kbd-enabled    '1'|'0'  (default '1')
 *   together-vbg-enabled    '1'|'0'  (background blur opt-in; default off)
 * ==========================================================================*/
(function () {
  'use strict';

  /* ───────────────────────────── Helpers ──────────────────────────────── */

  // Safe accessor for the dashboard's live-state bridge.
  function dash(name) {
    try { return window.__dash ? window.__dash[name] : undefined; }
    catch (e) { return undefined; }
  }

  // Is the dashboard rendered in Arabic? (bridge first, then DOM fallbacks)
  function isAr() {
    try {
      if (dash('forcedLang') === 'ar') return true;
      var d = document.documentElement;
      if (d && (d.lang === 'ar' || d.getAttribute('dir') === 'rtl')) return true;
    } catch (e) {}
    return false;
  }

  // Pick the right string for the current language.
  function t(en, ar) { return isAr() ? ar : en; }

  // Tiny DOM builder: el('div', {class:'x', onclick:fn}, child, child, ...)
  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v == null) continue;
        if (k === 'class' || k === 'className') node.className = v;
        else if (k === 'style' && typeof v === 'object') {
          for (var s in v) { if (Object.prototype.hasOwnProperty.call(v, s)) node.style[s] = v[s]; }
        }
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        }
        else if (k === 'dataset' && typeof v === 'object') {
          for (var dk in v) { if (Object.prototype.hasOwnProperty.call(v, dk)) node.dataset[dk] = v[dk]; }
        }
        else node.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  function byId(id) { try { return document.getElementById(id); } catch (e) { return null; } }
  function $(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { return null; } }
  function $$(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    catch (e) { return []; }
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Run a feature initialiser in isolation — it can never break the others.
  function safe(label, fn) {
    try { fn(); }
    catch (e) { try { console.warn('[dashboard-extras] ' + label + ' failed:', e); } catch (_) {} }
  }

  // localStorage read/write that never throw.
  function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function lsGetJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function lsSetJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  // Lightweight toast (theme-token styled). Bilingual-agnostic — caller supplies text.
  var _toastTimer = null;
  function toast(msg) {
    try {
      var box = byId('dx-toast');
      if (!box) {
        box = el('div', { id: 'dx-toast', class: 'dx-toast', role: 'status', 'aria-live': 'polite' });
        document.body.appendChild(box);
      }
      box.textContent = msg;
      box.classList.add('dx-toast--show');
      if (_toastTimer) clearTimeout(_toastTimer);
      _toastTimer = setTimeout(function () { box.classList.remove('dx-toast--show'); }, 2600);
    } catch (e) {}
  }

  function authFetchSafe(url, opts) {
    if (typeof window.authFetch === 'function') return window.authFetch(url, opts);
    return fetch(url, Object.assign({ credentials: 'include' }, opts || {}));
  }

  /* Two-digit / three-digit zero pad. */
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }

  function tsLabel(ms) {
    try {
      var d = new Date(ms);
      return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    } catch (e) { return '00:00:00'; }
  }

  /* ─────────────────── Shared state for the detection tracker ───────────── */
  // Timestamps of accepted detections — used by FEATURE 1 + FEATURE 4 (signs/min).
  var _detTimes = [];
  function pushDetTime() {
    var now = Date.now();
    _detTimes.push(now);
    // Trim anything older than 90s so the array can't grow unbounded.
    var cut = now - 90000;
    while (_detTimes.length && _detTimes[0] < cut) _detTimes.shift();
  }
  function signsPerMinute() {
    var cut = Date.now() - 60000, n = 0;
    for (var i = _detTimes.length - 1; i >= 0; i--) {
      if (_detTimes[i] >= cut) n++; else break;
    }
    return n;
  }

  function getThreshold() {
    var v = parseFloat(lsGet('together-conf-threshold'));
    return (isFinite(v) && v > 0) ? v : 0;
  }

  /* Push a finalized sentence/gloss into together-gloss-history (dedupe + cap 50). */
  function pushGlossHistory(text) {
    try {
      text = String(text || '').trim();
      if (!text) return;
      var hist = lsGetJSON('together-gloss-history', []);
      if (!Array.isArray(hist)) hist = [];
      if (hist.length && hist[hist.length - 1].text === text) return; // dedupe consecutive
      hist.push({ text: text, t: Date.now(), lang: isAr() ? 'ar' : 'en' });
      while (hist.length > 50) hist.shift();
      lsSetJSON('together-gloss-history', hist);
      renderGlossPanel(); // refresh the Recent panel if present
    } catch (e) {}
  }

  /* ════════════════════════════════════════════════════════════════════════
   * Inject the single <style> block (once). Everything dx-prefixed, tokens only.
   * ══════════════════════════════════════════════════════════════════════*/
  function injectStyles() {
    if (byId('dx-style')) return;
    var css = [
      /* floating cluster bottom-end so we never overlap the topbar controls */
      '.dx-cluster{position:fixed;inset-block-end:18px;inset-inline-end:18px;display:flex;flex-direction:column;gap:8px;z-index:40;align-items:flex-end}',
      '.dx-fab{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:40px;height:40px;border-radius:var(--radius-full,999px);background:var(--surface,#16161a);color:var(--text,#eee);border:1px solid var(--border,#2a2a32);cursor:pointer;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.4));font-size:16px;line-height:1;transition:transform .15s,border-color .15s}',
      '.dx-fab:hover{transform:translateY(-1px);border-color:var(--accent,#1f8a82)}',
      '.dx-fab--kbd{position:fixed;inset-block-end:18px;inset-inline-start:18px;z-index:30}',
      '.dx-fab--wide{width:auto;padding:0 12px;font-size:13px;font-weight:600}',
      /* generic modal / overlay */
      '.dx-overlay{position:fixed;inset:0;z-index:90;display:none;align-items:center;justify-content:center;background:var(--scrim,rgba(4,4,8,.65));padding:18px}',
      '.dx-overlay.dx-open{display:flex}',
      '.dx-modal{background:var(--surface,#16161a);color:var(--text,#eee);border:1px solid var(--border,#2a2a32);border-radius:var(--radius-lg,18px);box-shadow:var(--shadow-lg,0 30px 80px rgba(0,0,0,.55));max-width:440px;width:100%;max-height:85vh;overflow:auto;padding:20px 22px}',
      '.dx-modal h3{margin:0 0 4px;font-size:16px;font-weight:700}',
      '.dx-modal .dx-sub{color:var(--muted,#a8a8b3);font-size:12.5px;margin:0 0 14px}',
      '.dx-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}',
      '.dx-x{background:transparent;border:0;color:var(--muted,#a8a8b3);font-size:20px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:8px}',
      '.dx-x:hover{color:var(--text,#eee);background:var(--surface-2,#1f1f25)}',
      /* keyboard help table */
      '.dx-kbd-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:7px 0;border-block-end:1px solid var(--border,#2a2a32);font-size:13.5px}',
      '.dx-kbd-row:last-child{border-block-end:0}',
      '.dx-key{font-family:var(--font-mono,monospace);font-size:11.5px;background:var(--surface-2,#1f1f25);border:1px solid var(--border-strong,#34343d);border-radius:6px;padding:2px 7px;color:var(--text,#eee);white-space:nowrap}',
      /* signs/min row + chip */
      '.dx-spm-chip{position:fixed;inset-block-end:66px;inset-inline-end:18px;z-index:30;background:var(--surface,#16161a);border:1px solid var(--border,#2a2a32);border-radius:var(--radius-full,999px);color:var(--text,#eee);font-size:12px;padding:5px 11px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.4))}',
      '.dx-spm-chip b{color:var(--accent,#1f8a82)}',
      /* gloss / recent panel */
      '.dx-recent{margin-block:10px 4px;border:1px solid var(--border,#2a2a32);border-radius:var(--radius,13px);background:var(--surface,#16161a);overflow:hidden}',
      '.dx-recent-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--text,#eee);user-select:none}',
      '.dx-recent-head .dx-caret{transition:transform .18s;color:var(--muted,#a8a8b3)}',
      '.dx-recent.dx-collapsed .dx-recent-body{display:none}',
      '.dx-recent.dx-collapsed .dx-caret{transform:rotate(-90deg)}',
      '.dx-recent-body{max-height:230px;overflow:auto;padding:2px 6px 8px}',
      '.dx-recent-item{display:flex;align-items:center;gap:6px;padding:6px 6px;border-block-start:1px solid var(--border,#2a2a32);font-size:12.5px}',
      '.dx-recent-item:first-child{border-block-start:0}',
      '.dx-recent-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text,#eee)}',
      '.dx-mini{background:transparent;border:1px solid var(--border,#2a2a32);color:var(--muted,#a8a8b3);border-radius:7px;cursor:pointer;font-size:12px;line-height:1;padding:4px 6px}',
      '.dx-mini:hover{color:var(--text,#eee);border-color:var(--accent,#1f8a82)}',
      '.dx-recent-empty{padding:10px 12px;color:var(--faint,#6d6d78);font-size:12px}',
      /* settings popover rows */
      '.dx-set-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-block-end:1px solid var(--border,#2a2a32)}',
      '.dx-set-row:last-child{border-block-end:0}',
      '.dx-set-lbl{font-size:13px;color:var(--text,#eee)}',
      '.dx-set-lbl small{display:block;color:var(--muted,#a8a8b3);font-size:11px;margin-block-start:2px}',
      '.dx-set-val{font-family:var(--font-mono,monospace);font-size:12px;color:var(--accent,#1f8a82);min-width:38px;text-align:end}',
      '.dx-range{width:150px;accent-color:var(--accent,#1f8a82)}',
      '.dx-btn{background:var(--accent,#1f8a82);color:var(--accent-text,#fff);border:0;border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:600;cursor:pointer}',
      '.dx-btn--ghost{background:transparent;color:var(--text,#eee);border:1px solid var(--border,#2a2a32)}',
      '.dx-btn--ghost:hover{border-color:var(--accent,#1f8a82)}',
      '.dx-switch{position:relative;width:38px;height:21px;flex:none}',
      '.dx-switch input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}',
      '.dx-switch span{position:absolute;inset:0;border-radius:999px;background:var(--surface-2,#1f1f25);border:1px solid var(--border-strong,#34343d);transition:background .15s}',
      '.dx-switch span::after{content:"";position:absolute;inset-block-start:2px;inset-inline-start:2px;width:15px;height:15px;border-radius:50%;background:var(--muted,#a8a8b3);transition:transform .15s,background .15s}',
      '.dx-switch input:checked+span{background:var(--accent-soft,rgba(31,138,130,.25));border-color:var(--accent,#1f8a82)}',
      '.dx-switch input:checked+span::after{transform:translateX(17px);background:var(--accent,#1f8a82)}',
      'html[dir="rtl"] .dx-switch input:checked+span::after{transform:translateX(-17px)}',
      /* inline edit&compose */
      '.dx-edit-wrap{margin-block-start:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
      '.dx-edit-input{flex:1;min-width:140px;background:var(--surface-2,#1f1f25);border:1px solid var(--border,#2a2a32);border-radius:9px;color:var(--text,#eee);font-size:13px;padding:6px 9px}',
      '.dx-link-btn{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid var(--border,#2a2a32);color:var(--muted,#a8a8b3);border-radius:8px;font-size:12px;padding:4px 9px;cursor:pointer;margin-block-start:6px}',
      '.dx-link-btn:hover{color:var(--accent,#1f8a82);border-color:var(--accent,#1f8a82)}',
      /* demo canvas */
      '.dx-demo-canvas{width:320px;height:320px;max-width:100%;border-radius:var(--radius,13px);background:#08080c;border:1px solid var(--border,#2a2a32);display:block;margin:0 auto}',
      '.dx-demo-cap{text-align:center;color:var(--muted,#a8a8b3);font-size:13px;margin-block-start:12px}',
      /* export menu */
      '.dx-menu{position:fixed;z-index:95;background:var(--surface,#16161a);border:1px solid var(--border,#2a2a32);border-radius:var(--radius,13px);box-shadow:var(--shadow-lg,0 30px 80px rgba(0,0,0,.55));padding:5px;min-width:150px}',
      '.dx-menu button{display:block;width:100%;text-align:start;background:transparent;border:0;color:var(--text,#eee);font-size:13px;padding:7px 10px;border-radius:8px;cursor:pointer}',
      '.dx-menu button:hover{background:var(--surface-2,#1f1f25)}',
      /* toast */
      '.dx-toast{position:fixed;inset-block-end:24px;inset-inline:0;margin-inline:auto;width:max-content;max-width:90vw;background:var(--surface,#16161a);color:var(--text,#eee);border:1px solid var(--border,#2a2a32);border-radius:var(--radius-full,999px);padding:9px 16px;font-size:13px;box-shadow:var(--shadow-lg,0 30px 80px rgba(0,0,0,.55));z-index:100;opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .2s,transform .2s}',
      '.dx-toast--show{opacity:1;transform:translateY(0)}',
      /* sidebar new-page links */
      '.dx-nav-sep{height:1px;background:var(--border,#2a2a32);margin:8px 0}'
    ].join('\n');
    var style = el('style', { id: 'dx-style', type: 'text/css' });
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  // Ensure the bottom-end floating cluster exists; return it.
  function getCluster() {
    var c = byId('dx-cluster');
    if (!c) {
      c = el('div', { id: 'dx-cluster', class: 'dx-cluster' });
      document.body.appendChild(c);
    }
    return c;
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 1 — Detection hook: analytics logging + signs/min + confidence filter
   * Wrap window.handleDetectedSign (vision, has conf) and window.s2spHandleSign
   * (speech, no conf — never filter there).
   * ══════════════════════════════════════════════════════════════════════*/
  function recordDetection(word, conf, mod) {
    try {
      var arr = lsGetJSON('together-analytics', []);
      if (!Array.isArray(arr)) arr = [];
      arr.push({
        w: String(word || ''),
        c: Math.round((typeof conf === 'number' ? conf : 0.9) * 100),
        t: Date.now(),
        lang: isAr() ? 'ar' : 'en',
        mod: mod
      });
      while (arr.length > 2000) arr.shift(); // cap 2000, drop oldest
      lsSetJSON('together-analytics', arr);
    } catch (e) {}
    pushDetTime();      // feed the signs/min tracker
    updateSpmReadout(); // refresh FEATURE 4 readout immediately
  }

  function installDetectionHooks() {
    // Vision (Sign → Text): signature (word, conf). Apply user confidence filter.
    if (typeof window.handleDetectedSign === 'function' && !window.handleDetectedSign.__dxWrapped) {
      var _origVision = window.handleDetectedSign;
      window.handleDetectedSign = function (word, conf) {
        try {
          var thr = getThreshold();
          // Only filter when a real numeric confidence > 0 is present.
          if (thr > 0 && typeof conf === 'number' && conf > 0 && conf < thr) return;
          recordDetection(word, conf, 'vision');
        } catch (e) {}
        return _origVision.apply(this, arguments);
      };
      window.handleDetectedSign.__dxWrapped = true;
    }

    // Speech (Sign → Speech): signature (word) — no conf, so NO threshold filter.
    if (typeof window.s2spHandleSign === 'function' && !window.s2spHandleSign.__dxWrapped) {
      var _origSpeech = window.s2spHandleSign;
      window.s2spHandleSign = function (word) {
        try { recordDetection(word, undefined, 'speech'); } catch (e) {}
        return _origSpeech.apply(this, arguments);
      };
      window.s2spHandleSign.__dxWrapped = true;
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 2 — Sidebar nav links to the new pages (real navigations)
   * ══════════════════════════════════════════════════════════════════════*/
  function navSvg(kind) {
    var paths = {
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      bar:  '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[kind] || '') + '</svg>';
  }

  function buildNavLink(href, kind, name, sub) {
    var a = el('a', { class: 't-nav-item', href: href });
    a.innerHTML = navSvg(kind) +
      '<span class="t-nav-label"><b></b><i></i></span>';
    var lbl = a.querySelector('.t-nav-label');
    if (lbl) { lbl.querySelector('b').textContent = name; lbl.querySelector('i').textContent = sub; }
    return a;
  }

  function installSidebarLinks() {
    var nav = $('nav[aria-label="Modules"]');
    if (!nav) return;
    if (nav.querySelector('.dx-nav-sep')) return; // already added
    var q = isAr() ? '?lang=ar' : '';
    nav.appendChild(el('div', { class: 'dx-nav-sep' }));
    nav.appendChild(buildNavLink('/dictionary' + q, 'book',
      t('Dictionary', 'القاموس'), t('Browse signs', 'تصفّح الإشارات')));
    nav.appendChild(buildNavLink('/analytics' + q, 'bar',
      t('Analytics', 'التحليلات'), t('Your stats', 'إحصاءاتك')));
    nav.appendChild(buildNavLink('/practice' + q, 'target',
      t('Practice', 'تدريب'), t('Improve', 'تدرّب')));
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 3 — Keyboard shortcuts + help overlay
   * ══════════════════════════════════════════════════════════════════════*/
  function kbdEnabled() { return lsGet('together-kbd-enabled') !== '0'; } // default on

  function activeModuleKey() {
    var m = dash('currentModule');
    if (m) return m;
    var panel = $('.module-panel.active');
    if (panel && panel.id) {
      var map = {
        'panel-vision': 'vision', 'panel-speech': 'speech',
        'panel-text2sign': 'text2sign', 'panel-speech2sign': 'speech2sign',
        'panel-meeting': 'meeting'
      };
      return map[panel.id] || null;
    }
    return null;
  }

  function toggleActiveCamera() {
    var m = activeModuleKey();
    if (m === 'vision') { if (typeof window.toggleCamera === 'function') window.toggleCamera(); }
    else if (m === 'speech') { if (typeof window.toggleS2SpCamera === 'function') window.toggleS2SpCamera(); }
  }

  function isTypingTarget(elm) {
    if (!elm) return false;
    var tag = (elm.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (elm.isContentEditable) return true;
    return false;
  }

  function buildHelpOverlay() {
    if (byId('dx-help')) return;
    var rows = [
      ['Space', t('Toggle active camera', 'تبديل الكاميرا النشطة')],
      ['C', t('Toggle active camera', 'تبديل الكاميرا النشطة')],
      ['1 – 5', t('Switch module', 'تبديل الوحدة')],
      ['Esc', t('Clear / blur input', 'مسح / إلغاء التركيز')],
      ['?', t('Show this help', 'إظهار هذه المساعدة')]
    ];
    var body = el('div');
    rows.forEach(function (r) {
      body.appendChild(el('div', { class: 'dx-kbd-row' },
        el('span', { text: r[1] }),
        el('span', { class: 'dx-key', text: r[0] })
      ));
    });
    var modal = el('div', { class: 'dx-modal', role: 'dialog', 'aria-modal': 'true' },
      el('div', { class: 'dx-modal-head' },
        el('div', null,
          el('h3', { text: t('Keyboard shortcuts', 'اختصارات لوحة المفاتيح') }),
          el('p', { class: 'dx-sub', text: t('Quick keys for the dashboard.', 'مفاتيح سريعة للوحة التحكم.') })
        ),
        el('button', { class: 'dx-x', 'aria-label': t('Close', 'إغلاق'), onclick: closeHelp }, '×')
      ),
      body
    );
    var ov = el('div', { id: 'dx-help', class: 'dx-overlay' }, modal);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeHelp(); });
    document.body.appendChild(ov);
  }
  function openHelp() { buildHelpOverlay(); var o = byId('dx-help'); if (o) o.classList.add('dx-open'); }
  function closeHelp() { var o = byId('dx-help'); if (o) o.classList.remove('dx-open'); }
  function toggleHelp() {
    buildHelpOverlay();
    var o = byId('dx-help'); if (!o) return;
    if (o.classList.contains('dx-open')) closeHelp(); else openHelp();
  }

  function installKeyboard() {
    buildHelpOverlay();

    // Floating "⌨" button (bottom-start, low z).
    if (!byId('dx-kbd-fab')) {
      var fab = el('button', {
        id: 'dx-kbd-fab', class: 'dx-fab dx-fab--kbd',
        title: t('Keyboard shortcuts', 'اختصارات لوحة المفاتيح'),
        'aria-label': t('Keyboard shortcuts', 'اختصارات لوحة المفاتيح'),
        onclick: openHelp
      }, '⌨');
      document.body.appendChild(fab);
    }

    document.addEventListener('keydown', function (e) {
      try {
        if (!kbdEnabled()) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;          // ignore modifier combos
        if (isTypingTarget(e.target)) {
          // Allow Escape to blur a focused field even while typing.
          if (e.key === 'Escape') { try { e.target.blur(); } catch (_) {} }
          return;
        }
        var k = e.key;
        if (k === ' ' || k === 'Spacebar') { e.preventDefault(); toggleActiveCamera(); return; }
        if (k === 'c' || k === 'C') { e.preventDefault(); toggleActiveCamera(); return; }
        if (k === 'Escape') {
          var ae = document.activeElement;
          if (ae && typeof ae.blur === 'function') ae.blur();
          closeHelp();
          return;
        }
        if (k === '?') { e.preventDefault(); toggleHelp(); return; }
        if (k >= '1' && k <= '5') {
          var keys = ['vision', 'speech', 'text2sign', 'speech2sign', 'meeting'];
          var target = keys[parseInt(k, 10) - 1];
          if (target && typeof window.switchModule === 'function') {
            e.preventDefault();
            window.switchModule(null, target);
          }
          return;
        }
      } catch (err) {}
    }, true);
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 4 — Signs/min meter (recomputed every 3s; also pushed by FEATURE 1)
   * ══════════════════════════════════════════════════════════════════════*/
  function installSpmReadout() {
    // Prefer to inject a row into the usage card containing #usage-signs-today.
    if (byId('dx-spm-val')) return;
    var anchor = byId('usage-signs-today');
    var card = anchor ? (anchor.closest ? anchor.closest('.d-usage-card') : null) : null;
    if (card) {
      var row = el('div', { class: 'd-usage-row' },
        el('span', { class: 'd-usage-lbl', text: t('Signs / min', 'إشارات / دقيقة') }),
        el('span', { class: 'd-usage-val', id: 'dx-spm-val', text: '0' })
      );
      card.appendChild(row);
    } else {
      // Fallback: small fixed chip.
      var chip = el('div', { class: 'dx-spm-chip' });
      chip.innerHTML = (isAr() ? 'إشارات/دقيقة: ' : 'Signs/min: ') + '<b id="dx-spm-val">0</b>';
      document.body.appendChild(chip);
    }
    updateSpmReadout();
    setInterval(updateSpmReadout, 3000);
  }
  function updateSpmReadout() {
    var v = byId('dx-spm-val');
    if (v) v.textContent = String(signsPerMinute());
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 5 — Gloss / sentence history (sidebar "Recent" panel)
   * ══════════════════════════════════════════════════════════════════════*/
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance(String(text || ''));
      u.lang = isAr() ? 'ar' : 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(String(text || '')).then(function () {
          toast(t('Copied', 'تم النسخ'));
        }, function () {});
      }
    } catch (e) {}
  }

  function buildRecentPanel() {
    if (byId('dx-recent')) return byId('dx-recent');
    var panel = el('div', { id: 'dx-recent', class: 'dx-recent' });
    var head = el('div', { class: 'dx-recent-head', onclick: function () {
      panel.classList.toggle('dx-collapsed');
    } },
      el('span', { text: t('Recent', 'الأخيرة') }),
      el('span', { class: 'dx-caret', html: '▾' })
    );
    var body = el('div', { class: 'dx-recent-body', id: 'dx-recent-body' });
    panel.appendChild(head);
    panel.appendChild(body);

    // Place near the sidebar user link, else float in the cluster.
    var userLink = byId('sb-user-link');
    if (userLink && userLink.parentNode) {
      userLink.parentNode.insertBefore(panel, userLink);
    } else {
      panel.style.position = 'fixed';
      panel.style.insetBlockEnd = '110px';
      panel.style.insetInlineEnd = '18px';
      panel.style.width = '230px';
      panel.style.zIndex = '30';
      document.body.appendChild(panel);
    }
    return panel;
  }

  function renderGlossPanel() {
    var body = byId('dx-recent-body');
    if (!body) return;
    var hist = lsGetJSON('together-gloss-history', []);
    if (!Array.isArray(hist)) hist = [];
    var last = hist.slice(-10).reverse();
    body.innerHTML = '';
    if (!last.length) {
      body.appendChild(el('div', { class: 'dx-recent-empty',
        text: t('No recent sentences.', 'لا توجد جمل حديثة.') }));
      return;
    }
    last.forEach(function (h) {
      var item = el('div', { class: 'dx-recent-item' },
        el('span', { class: 'dx-recent-text', title: h.text, text: h.text }),
        el('button', { class: 'dx-mini', title: t('Copy', 'نسخ'),
          onclick: function () { copyText(h.text); } }, '⧉'),
        el('button', { class: 'dx-mini', title: t('Speak', 'نطق'),
          onclick: function () { speak(h.text); } }, '🔊')
      );
      body.appendChild(item);
    });
  }

  function installGlossHistory() {
    buildRecentPanel();
    renderGlossPanel();

    // Observe finalized sentence outputs + session logs. New non-empty changed
    // text → push to together-gloss-history (dedupe consecutive + cap 50).
    var lastSeen = {};
    function captureFrom(node, key) {
      if (!node) return;
      var txt = (node.textContent || '').trim();
      if (!txt) return;
      // Skip obvious placeholders (still text but transient prompts).
      if (/^(waiting|signs appear|forming sentence|جاري|بانتظار|تظهر)/i.test(txt)) return;
      if (lastSeen[key] === txt) return;
      lastSeen[key] = txt;
      pushGlossHistory(txt);
    }

    var sentenceIds = ['s2sp-sentence-output', 'transcription-output'];
    sentenceIds.forEach(function (id) {
      var node = byId(id);
      if (!node) return;
      captureFrom(node, id);
      try {
        var obs = new MutationObserver(function () { captureFrom(node, id); });
        obs.observe(node, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    });

    // Session logs: capture newly added .d-log-item / .d-log-msg text.
    ['session-log', 's2sp-log'].forEach(function (id) {
      var log = byId(id);
      if (!log) return;
      try {
        var obs = new MutationObserver(function (muts) {
          muts.forEach(function (m) {
            Array.prototype.forEach.call(m.addedNodes || [], function (n) {
              if (n.nodeType !== 1) return;
              var msg = n.classList && n.classList.contains('d-log-msg')
                ? n
                : (n.querySelector ? n.querySelector('.d-log-msg') : null);
              var txt = ((msg ? msg.textContent : n.textContent) || '').trim();
              if (txt) pushGlossHistory(txt);
            });
          });
        });
        obs.observe(log, { childList: true, subtree: true });
      } catch (e) {}
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 6 — Caption / transcript export (.txt and .srt)
   * ══════════════════════════════════════════════════════════════════════*/
  function collectTranscript() {
    var entries = []; // {t, text}
    // Preferred: gloss-history.
    var hist = lsGetJSON('together-gloss-history', []);
    if (Array.isArray(hist)) {
      hist.forEach(function (h) {
        if (h && h.text) entries.push({ t: h.t || Date.now(), text: String(h.text) });
      });
    }
    // Plus session log items currently in the DOM.
    ['session-log', 's2sp-log'].forEach(function (id) {
      var log = byId(id);
      if (!log) return;
      $$('.d-log-item', log).forEach(function (item) {
        var time = $('.d-log-time', item);
        var msg = $('.d-log-msg', item);
        var text = msg ? (msg.textContent || '').trim() : (item.textContent || '').trim();
        if (!text) return;
        entries.push({ t: time ? time.textContent.trim() : null, text: text });
      });
    });
    // Dedupe consecutive identical lines.
    var out = [];
    entries.forEach(function (e) {
      if (out.length && out[out.length - 1].text === e.text) return;
      out.push(e);
    });
    return out;
  }

  function downloadBlob(filename, mime, content) {
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = el('a', { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { try { URL.revokeObjectURL(url); a.remove(); } catch (_) {} }, 500);
    } catch (e) {}
  }

  function stampName() {
    var d = new Date();
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes());
  }

  function srtTime(ms) {
    var total = Math.floor(ms);
    var h = Math.floor(total / 3600000); total -= h * 3600000;
    var m = Math.floor(total / 60000); total -= m * 60000;
    var s = Math.floor(total / 1000); var msPart = total - s * 1000;
    return pad(h) + ':' + pad(m) + ':' + pad(s) + ',' + pad(msPart, 3);
  }

  function exportTranscript(kind) {
    var entries = collectTranscript();
    if (!entries.length) { toast(t('Nothing to export yet', 'لا يوجد ما يُصدّر بعد')); return; }
    var name = 'together-transcript-' + stampName();
    if (kind === 'txt') {
      var lines = entries.map(function (e) {
        var ts = (typeof e.t === 'number') ? tsLabel(e.t) : (e.t || tsLabel(Date.now()));
        return '[' + ts + '] ' + e.text;
      });
      downloadBlob(name + '.txt', 'text/plain;charset=utf-8', lines.join('\n') + '\n');
    } else {
      var dur = 2500; // 2.5s per cue, sequential from 00:00:00,000
      var cues = entries.map(function (e, i) {
        var start = i * dur, end = start + dur;
        return (i + 1) + '\n' + srtTime(start) + ' --> ' + srtTime(end) + '\n' + e.text + '\n';
      });
      downloadBlob(name + '.srt', 'application/x-subrip;charset=utf-8', cues.join('\n'));
    }
  }

  function installExport() {
    if (byId('dx-export-fab')) return;
    var fab = el('button', {
      id: 'dx-export-fab', class: 'dx-fab', title: t('Export transcript', 'تصدير النص'),
      'aria-label': t('Export transcript', 'تصدير النص')
    }, '⬇');
    var menu = null;
    function closeMenu() { if (menu) { menu.remove(); menu = null; document.removeEventListener('click', onDoc, true); } }
    function onDoc(e) { if (menu && !menu.contains(e.target) && e.target !== fab) closeMenu(); }
    fab.addEventListener('click', function () {
      if (menu) { closeMenu(); return; }
      menu = el('div', { class: 'dx-menu' },
        el('button', { onclick: function () { closeMenu(); exportTranscript('txt'); } },
          t('Export .txt', 'تصدير .txt')),
        el('button', { onclick: function () { closeMenu(); exportTranscript('srt'); } },
          t('Export .srt', 'تصدير .srt'))
      );
      document.body.appendChild(menu);
      var r = fab.getBoundingClientRect();
      menu.style.insetBlockEnd = (window.innerHeight - r.top + 6) + 'px';
      menu.style.insetInlineEnd = (window.innerWidth - r.right) + 'px';
      setTimeout(function () { document.addEventListener('click', onDoc, true); }, 0);
    });
    getCluster().appendChild(fab);
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 7 — Sentence correction (edit gloss → compose)
   * Self-contained: never touches the dashboard's internal buffers.
   * ══════════════════════════════════════════════════════════════════════*/
  function glossTextOf(box) {
    if (!box) return '';
    // Strip placeholder spans.
    var clone = box.cloneNode(true);
    $$('.d-box-ph, .d-sentence-ph', clone).forEach(function (p) { p.remove(); });
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installSentenceCorrection() {
    var targets = [
      { boxId: 's2sp-gloss-output', outId: 's2sp-sentence-output' },
      { boxId: 'transcription-output', outId: null }
    ];
    targets.forEach(function (cfg) {
      var box = byId(cfg.boxId);
      if (!box) return;
      if (box.parentNode && box.parentNode.querySelector('.dx-ec-btn')) return;

      var btn = el('button', { class: 'dx-link-btn dx-ec-btn' },
        '✎ ' + t('Edit & compose', 'تعديل وتكوين'));
      var host = box.parentNode || box;

      btn.addEventListener('click', function () {
        var current = glossTextOf(box);
        if (!current) return; // guard: empty box → do nothing
        if (host.querySelector('.dx-edit-wrap')) return; // already editing

        var input = el('input', { class: 'dx-edit-input', type: 'text', value: current });
        var compose = el('button', { class: 'dx-btn' }, t('Compose', 'تكوين'));
        var cancel = el('button', { class: 'dx-btn dx-btn--ghost' }, t('Cancel', 'إلغاء'));
        var wrap = el('div', { class: 'dx-edit-wrap' }, input, compose, cancel);

        function teardown() { try { wrap.remove(); } catch (_) {} btn.style.display = ''; }
        cancel.addEventListener('click', teardown);

        compose.addEventListener('click', function () {
          var edited = (input.value || '').trim();
          if (!edited) { teardown(); return; }
          var words = edited.split(/\s+/).filter(Boolean);
          compose.disabled = true; compose.textContent = t('…', '…');
          authFetchSafe('/api/translate/sentence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gloss: words, language: isAr() ? 'arabic' : 'english' })
          }).then(function (res) {
            return res && res.ok ? res.json() : null;
          }).then(function (data) {
            var sentence = data && data.sentence ? data.sentence : edited;
            var out = cfg.outId ? byId(cfg.outId) : null;
            if (out) {
              out.textContent = sentence;
            } else {
              // Small inline result line under this box.
              var line = host.querySelector('.dx-ec-result');
              if (!line) {
                line = el('div', { class: 'dx-ec-result', style: {
                  marginBlockStart: '6px', fontSize: '13px', color: 'var(--text)'
                } });
                host.appendChild(line);
              }
              line.textContent = sentence;
            }
            pushGlossHistory(sentence);
            teardown();
          }).catch(function () {
            toast(t('Compose failed', 'فشل التكوين'));
            compose.disabled = false; compose.textContent = t('Compose', 'تكوين');
          });
        });

        btn.style.display = 'none';
        host.appendChild(wrap);
        try { input.focus(); input.select(); } catch (_) {}
      });

      host.appendChild(btn);
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 8 — One-click demo (plays a sample sign without the camera)
   * ══════════════════════════════════════════════════════════════════════*/
  function flattenFrame(frame) {
    if (!frame) return null;
    if (typeof frame[0] === 'number') return frame; // already flat
    try { return frame.flat ? frame.flat() : [].concat.apply([], frame); } catch (e) { return frame; }
  }

  function buildDemoOverlay() {
    if (byId('dx-demo')) return;
    var canvas = el('canvas', { id: 'dx-demo-canvas', class: 'dx-demo-canvas', width: '320', height: '320' });
    var cap = el('div', { id: 'dx-demo-cap', class: 'dx-demo-cap', text: t('Loading demo…', 'جارٍ تحميل العرض…') });
    var modal = el('div', { class: 'dx-modal', role: 'dialog', 'aria-modal': 'true', style: { maxWidth: '380px' } },
      el('div', { class: 'dx-modal-head' },
        el('h3', { text: t('Quick demo', 'عرض سريع') }),
        el('button', { class: 'dx-x', 'aria-label': t('Close', 'إغلاق'), onclick: closeDemo }, '×')
      ),
      canvas, cap
    );
    var ov = el('div', { id: 'dx-demo', class: 'dx-overlay' }, modal);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeDemo(); });
    document.body.appendChild(ov);
  }
  var _demoPlaying = false;
  function closeDemo() {
    _demoPlaying = false;
    var o = byId('dx-demo'); if (o) o.classList.remove('dx-open');
  }
  async function openDemo() {
    buildDemoOverlay();
    var ov = byId('dx-demo'); if (ov) ov.classList.add('dx-open');
    var canvas = byId('dx-demo-canvas');
    var cap = byId('dx-demo-cap');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;

    // Idle pose first.
    if (typeof window.drawAuraAvatar === 'function') {
      try { window.drawAuraAvatar(ctx, null, w, h); } catch (e) {}
    }

    // Fetch landmarks for a common word — try a few fallbacks.
    var words = ['hello', 'thanks', 'good'];
    var data = null, usedWord = null;
    for (var i = 0; i < words.length && !data; i++) {
      try {
        var res = await authFetchSafe('/api/signs/' + encodeURIComponent(words[i]));
        if (res && res.ok) { data = await res.json(); usedWord = words[i]; }
      } catch (e) {}
    }
    if (!data || !data.landmarks || !data.landmarks.length || typeof window.drawAuraAvatar !== 'function') {
      if (cap) cap.textContent = t('Demo unavailable offline', 'العرض غير متاح بدون اتصال');
      return;
    }
    if (cap) {
      cap.textContent = isAr()
        ? 'هكذا تُؤدّى إشارة "' + usedWord + '".'
        : 'This is how you sign "' + usedWord + '".';
    }

    _demoPlaying = true;
    var frames = data.landmarks;
    var lastFlat = null;
    for (var f = 0; f < frames.length && _demoPlaying; f++) {
      var flat = flattenFrame(frames[f]);
      lastFlat = flat;
      try { window.drawAuraAvatar(ctx, flat, w, h); } catch (e) {}
      await sleep(25); // ~40fps
    }
    // Hold the last frame.
    if (lastFlat && _demoPlaying) { try { window.drawAuraAvatar(ctx, lastFlat, w, h); } catch (e) {} }
  }

  function installDemo() {
    if (byId('dx-demo-fab')) return;
    var fab = el('button', {
      id: 'dx-demo-fab', class: 'dx-fab dx-fab--wide', title: t('Play demo', 'تشغيل العرض'),
      'aria-label': t('Play demo', 'تشغيل العرض'),
      onclick: function () { openDemo(); }
    }, '▶ ' + t('Demo', 'عرض'));
    getCluster().appendChild(fab);
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 9 — Settings popover (confidence threshold + toggles + notifications)
   * ══════════════════════════════════════════════════════════════════════*/
  function buildSettingsOverlay() {
    if (byId('dx-settings')) return;

    // ── Confidence threshold slider (50%–95%) ──
    var thr = getThreshold();
    var initPct = thr > 0 ? Math.round(thr * 100) : 50;
    if (initPct < 50) initPct = 50; if (initPct > 95) initPct = 95;
    var range = el('input', { class: 'dx-range', type: 'range', min: '50', max: '95', step: '5', value: String(initPct) });
    var rangeVal = el('span', { class: 'dx-set-val', text: initPct + '%' });
    range.addEventListener('input', function () {
      var pct = parseInt(range.value, 10);
      rangeVal.textContent = pct + '%';
      // 50% → treat as off/minimal; store 0.50..0.95.
      lsSet('together-conf-threshold', (pct / 100).toFixed(2));
    });
    var rowThr = el('div', { class: 'dx-set-row' },
      el('div', { class: 'dx-set-lbl', html: t('Detection confidence threshold', 'حدّ ثقة الكشف') +
        '<small>' + t('Filter low-confidence signs', 'تصفية الإشارات منخفضة الثقة') + '</small>' }),
      el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, range, rangeVal)
    );

    // ── Keyboard shortcuts toggle ──
    var kbdChk = el('input', { type: 'checkbox' });
    kbdChk.checked = kbdEnabled();
    kbdChk.addEventListener('change', function () {
      lsSet('together-kbd-enabled', kbdChk.checked ? '1' : '0');
    });
    var rowKbd = el('div', { class: 'dx-set-row' },
      el('div', { class: 'dx-set-lbl', text: t('Keyboard shortcuts', 'اختصارات لوحة المفاتيح') }),
      el('label', { class: 'dx-switch' }, kbdChk, el('span'))
    );

    // ── Background blur toggle (FEATURE 11) ──
    var vbgChk = el('input', { type: 'checkbox' });
    vbgChk.checked = lsGet('together-vbg-enabled') === '1';
    vbgChk.addEventListener('change', function () {
      lsSet('together-vbg-enabled', vbgChk.checked ? '1' : '0');
      if (vbgChk.checked) enableVbg(); else disableVbg();
    });
    var rowVbg = el('div', { class: 'dx-set-row' },
      el('div', { class: 'dx-set-lbl', text: t('Background blur in meetings', 'تمويه الخلفية في الاجتماعات') }),
      el('label', { class: 'dx-switch' }, vbgChk, el('span'))
    );

    // ── Desktop notifications button (FEATURE 10) ──
    var notifBtn = el('button', { class: 'dx-btn dx-btn--ghost' }, t('Enable', 'تفعيل'));
    function refreshNotifBtn() {
      if (!('Notification' in window)) {
        notifBtn.textContent = t('Unsupported', 'غير مدعوم'); notifBtn.disabled = true; return;
      }
      if (Notification.permission === 'granted') { notifBtn.textContent = t('Enabled', 'مفعّل'); notifBtn.disabled = true; }
      else if (Notification.permission === 'denied') { notifBtn.textContent = t('Blocked', 'محظور'); notifBtn.disabled = true; }
      else { notifBtn.textContent = t('Enable', 'تفعيل'); notifBtn.disabled = false; }
    }
    notifBtn.addEventListener('click', function () {
      try {
        if ('Notification' in window && Notification.requestPermission) {
          var p = Notification.requestPermission(function () { refreshNotifBtn(); });
          if (p && p.then) p.then(function () { refreshNotifBtn(); });
        }
      } catch (e) {}
    });
    refreshNotifBtn();
    var rowNotif = el('div', { class: 'dx-set-row' },
      el('div', { class: 'dx-set-lbl', text: t('Desktop notifications', 'إشعارات سطح المكتب') }),
      notifBtn
    );

    var modal = el('div', { class: 'dx-modal', role: 'dialog', 'aria-modal': 'true' },
      el('div', { class: 'dx-modal-head' },
        el('div', null,
          el('h3', { text: t('Settings', 'الإعدادات') }),
          el('p', { class: 'dx-sub', text: t('Tune detection and meeting options.', 'اضبط خيارات الكشف والاجتماع.') })
        ),
        el('button', { class: 'dx-x', 'aria-label': t('Close', 'إغلاق'), onclick: closeSettings }, '×')
      ),
      rowThr, rowKbd, rowVbg, rowNotif
    );
    var ov = el('div', { id: 'dx-settings', class: 'dx-overlay' }, modal);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeSettings(); });
    document.body.appendChild(ov);
  }
  function closeSettings() { var o = byId('dx-settings'); if (o) o.classList.remove('dx-open'); }
  function openSettings() { buildSettingsOverlay(); var o = byId('dx-settings'); if (o) o.classList.add('dx-open'); }

  function installSettings() {
    if (byId('dx-settings-fab')) return;
    var fab = el('button', {
      id: 'dx-settings-fab', class: 'dx-fab', title: t('Settings', 'الإعدادات'),
      'aria-label': t('Settings', 'الإعدادات'),
      onclick: openSettings
    }, '⚙');
    getCluster().appendChild(fab);
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 10 — Meeting notification badges (debounced, opt-in via permission)
   * ══════════════════════════════════════════════════════════════════════*/
  var _lastNotifyAt = 0;
  function notifyPeerJoined() {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      var now = Date.now();
      if (now - _lastNotifyAt < 4000) return; // debounce — at most once per join
      _lastNotifyAt = now;
      new Notification('Together', {
        body: t('A participant joined your meeting', 'انضم مشارك إلى اجتماعك'),
        icon: '/static/img/logo-mark-color.png'
      });
    } catch (e) {}
  }

  function installMeetingNotifications() {
    var peer = byId('participant-peer');
    if (peer) {
      var prev = (peer.textContent || '').trim();
      var isPlaceholder = function (s) { return /waiting|بانتظار|peer…|peer\.\.\./i.test(s) || s === ''; };
      try {
        var obs = new MutationObserver(function () {
          var cur = (peer.textContent || '').trim();
          if (cur !== prev) {
            if (isPlaceholder(prev) && !isPlaceholder(cur)) notifyPeerJoined();
            prev = cur;
          }
        });
        obs.observe(peer, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    }

    var pill = byId('meeting-status-pill');
    if (pill) {
      var prevPill = (pill.textContent || '').trim();
      try {
        var obs2 = new MutationObserver(function () {
          var cur = (pill.textContent || '').trim();
          if (cur !== prevPill) {
            if (/connected|متصل/i.test(cur) && !/connecting|جارٍ|جاري/i.test(cur)) notifyPeerJoined();
            prevPill = cur;
          }
        });
        obs2.observe(pill, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
   * FEATURE 11 — Virtual background blur (meeting camera) — GUARDED / OPT-IN
   * ══════════════════════════════════════════════════════════════════════*/
  var _vbg = {
    active: false,           // processing running
    poll: null,              // 2s re-check interval while enabled
    seg: null,               // SelfieSegmentation instance
    rafVideo: null,          // offscreen <video>
    rafCanvas: null,         // processing <canvas>
    outStream: null,         // canvas.captureStream
    originalTrack: null,     // the camera track we replaced
    loading: false,          // mediapipe script loading
    raf: 0                   // requestAnimationFrame handle
  };

  function loadMediaPipe() {
    return new Promise(function (resolve, reject) {
      if (window.SelfieSegmentation) { resolve(); return; }
      if (_vbg.loading) {
        // Poll until the in-flight load resolves.
        var iv = setInterval(function () {
          if (window.SelfieSegmentation) { clearInterval(iv); resolve(); }
        }, 200);
        setTimeout(function () { clearInterval(iv); window.SelfieSegmentation ? resolve() : reject(new Error('timeout')); }, 8000);
        return;
      }
      _vbg.loading = true;
      var s = el('script', {
        src: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js',
        crossorigin: 'anonymous'
      });
      s.onload = function () { _vbg.loading = false; window.SelfieSegmentation ? resolve() : reject(new Error('no global')); };
      s.onerror = function () { _vbg.loading = false; reject(new Error('script error')); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function vbgReset() {
    // Reset the toggle preference + the popover switch (if currently rendered).
    lsSet('together-vbg-enabled', '0');
    try {
      var inputs = $$('#dx-settings .dx-switch input');
      if (inputs[1]) inputs[1].checked = false; // vbg is the 2nd .dx-switch in the popover
    } catch (e) {}
  }

  // Collect the outgoing video sender from every peer connection (mesh-aware,
  // with a 1:1 fallback). Applies background blur to all peers present at enable
  // time. NOTE: peers that join AFTER blur is enabled receive the raw camera
  // (known limitation — toggle blur off/on after everyone has joined to re-apply).
  function allVideoSenders() {
    var senders = [];
    var pcs = dash('peerConnections'); // mesh: array of RTCPeerConnection
    if (!pcs || !pcs.length) { var single = dash('peerConnection'); pcs = single ? [single] : []; }
    pcs.forEach(function (pc) {
      try {
        var s = pc.getSenders().find(function (x) { return x.track && x.track.kind === 'video'; });
        if (s) senders.push(s);
      } catch (e) {}
    });
    return senders;
  }

  async function startVbgProcessing() {
    var stream = dash('meetingCamStream');
    var senders = allVideoSenders();
    if (!stream || !senders.length) return false; // not in a meeting with a camera yet — caller retries

    try {
      await loadMediaPipe();
    } catch (e) {
      console.warn('[dashboard-extras] MediaPipe failed to load:', e);
      toast(t('Background blur unavailable', 'تمويه الخلفية غير متاح'));
      vbgReset();
      return true; // stop retrying
    }
    if (!window.SelfieSegmentation) { vbgReset(); return true; }

    // Offscreen video + processing canvas.
    var video = _vbg.rafVideo || el('video', { autoplay: '', playsinline: '', muted: '' });
    video.muted = true; video.srcObject = stream;
    try { await video.play(); } catch (e) {}
    _vbg.rafVideo = video;

    var vt = stream.getVideoTracks()[0];
    var settings = (vt && vt.getSettings) ? vt.getSettings() : {};
    var cw = settings.width || video.videoWidth || 640;
    var ch = settings.height || video.videoHeight || 480;

    var canvas = _vbg.rafCanvas || el('canvas');
    canvas.width = cw; canvas.height = ch;
    _vbg.rafCanvas = canvas;
    var cctx = canvas.getContext('2d');

    var seg = new window.SelfieSegmentation({
      locateFile: function (file) {
        return 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/' + file;
      }
    });
    seg.setOptions({ modelSelection: 1 });
    seg.onResults(function (results) {
      try {
        cctx.save();
        cctx.clearRect(0, 0, cw, ch);
        // 1) draw the segmentation mask
        cctx.drawImage(results.segmentationMask, 0, 0, cw, ch);
        // 2) keep only the person where the mask is opaque
        cctx.globalCompositeOperation = 'source-in';
        cctx.drawImage(results.image, 0, 0, cw, ch);
        // 3) draw the blurred full frame behind the person
        cctx.globalCompositeOperation = 'destination-over';
        cctx.filter = 'blur(12px)';
        cctx.drawImage(results.image, 0, 0, cw, ch);
        cctx.filter = 'none';
        cctx.restore();
      } catch (e) {}
    });
    _vbg.seg = seg;
    _vbg.originalTrack = senders[0].track;

    _vbg.active = true;
    var pump = async function () {
      if (!_vbg.active) return;
      try { if (video.readyState >= 2) await seg.send({ image: video }); } catch (e) {}
      _vbg.raf = requestAnimationFrame(pump);
    };
    pump();

    // Produce the processed stream and swap the outgoing track + local preview.
    try {
      _vbg.outStream = canvas.captureStream(24);
      var newTrack = _vbg.outStream.getVideoTracks()[0];
      if (newTrack) {
        for (var si = 0; si < senders.length; si++) { try { await senders[si].replaceTrack(newTrack); } catch (e) {} }
        var localVid = byId('meeting-local-video');
        if (localVid) localVid.srcObject = _vbg.outStream;
      }
    } catch (e) {
      console.warn('[dashboard-extras] replaceTrack failed:', e);
    }
    return true;
  }

  async function disableVbg() {
    _vbg.active = false;
    if (_vbg.raf) { try { cancelAnimationFrame(_vbg.raf); } catch (e) {} _vbg.raf = 0; }
    if (_vbg.poll) { clearInterval(_vbg.poll); _vbg.poll = null; }
    // Restore the original camera track to the sender + local preview.
    try {
      var senders = allVideoSenders();
      if (_vbg.originalTrack) {
        for (var si = 0; si < senders.length; si++) { try { await senders[si].replaceTrack(_vbg.originalTrack); } catch (e) {} }
        var localVid = byId('meeting-local-video');
        var orig = dash('meetingCamStream');
        if (localVid && orig) localVid.srcObject = orig;
      }
    } catch (e) {}
    // Tear down the segmentation instance + output stream.
    try { if (_vbg.outStream) _vbg.outStream.getTracks().forEach(function (tk) { tk.stop(); }); } catch (e) {}
    try { if (_vbg.seg && _vbg.seg.close) _vbg.seg.close(); } catch (e) {}
    _vbg.seg = null; _vbg.outStream = null; _vbg.originalTrack = null;
    if (_vbg.rafVideo) { try { _vbg.rafVideo.srcObject = null; } catch (e) {} }
  }

  function enableVbg() {
    // Remember the preference; apply now if a meeting camera is live, else poll.
    lsSet('together-vbg-enabled', '1');
    if (_vbg.poll) clearInterval(_vbg.poll);
    var tryStart = function () {
      if (lsGet('together-vbg-enabled') !== '1') { if (_vbg.poll) { clearInterval(_vbg.poll); _vbg.poll = null; } return; }
      if (_vbg.active) return;
      // Cheap no-op while there is no live meeting camera to process.
      if (!dash('inMeeting') || !dash('meetingCamStream')) return;
      startVbgProcessing().then(function (done) {
        // done === true means either started or permanently failed → stop polling.
        if (done && _vbg.poll) { clearInterval(_vbg.poll); _vbg.poll = null; }
      }).catch(function () {});
    };
    tryStart();
    _vbg.poll = setInterval(tryStart, 2000); // light re-check while enabled
  }

  function installVbg() {
    // If the user had it enabled previously, begin polling for a meeting camera.
    if (lsGet('together-vbg-enabled') === '1') enableVbg();
  }

  /* ════════════════════════════════════════════════════════════════════════
   * Boot — initialise every feature in isolation.
   * ══════════════════════════════════════════════════════════════════════*/
  function init() {
    safe('styles', injectStyles);
    safe('feature1-detection-hooks', installDetectionHooks);
    safe('feature2-sidebar-links', installSidebarLinks);
    safe('feature3-keyboard', installKeyboard);
    safe('feature4-signs-per-min', installSpmReadout);
    safe('feature5-gloss-history', installGlossHistory);
    safe('feature6-export', installExport);
    safe('feature7-sentence-correction', installSentenceCorrection);
    safe('feature8-demo', installDemo);
    safe('feature9-settings', installSettings);
    safe('feature10-meeting-notifications', installMeetingNotifications);
    safe('feature11-vbg', installVbg);

    // The dashboard's detection functions may be (re)assigned slightly after we
    // load; re-attempt the hook install a couple of times to be safe.
    setTimeout(function () { safe('feature1-rehook', installDetectionHooks); }, 800);
    setTimeout(function () { safe('feature1-rehook', installDetectionHooks); }, 2500);
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    try { console.warn('[dashboard-extras] init failed:', e); } catch (_) {}
  }

  console.log('[dashboard-extras] initialized');
})();
