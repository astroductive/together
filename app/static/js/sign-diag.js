/* Sign-pipeline diagnostics (opt-in, zero overhead when off).
 *
 * Enable:  add ?diag=1 to the URL, or localStorage.setItem('signDiag','1');
 * Disable: localStorage.removeItem('signDiag') (and remove ?diag=1).
 *
 * When enabled it shows a small HUD (delivered FPS, % frames with each hand
 * detected, payload counts, last accepted sign) and records the EXACT frames
 * sent to the server so a live session can be replayed offline through the
 * validated predictors (scripts/replay_live_dump.py). Download the dump with
 * the HUD button or SignDiag.dump().
 *
 * The dashboards/practice pages call three hooks, each a no-op when disabled:
 *   SignDiag.frame(results)                 — every MediaPipe onResults
 *   SignDiag.payload(module, frames, meta)  — exact payload passed to the
 *                                             socket emit or /api/translate
 *   SignDiag.event(module, kind, data)      — sign_conf / sign_detected / etc.
 */
(function () {
  'use strict';

  var enabled = false;
  try {
    enabled = /[?&]diag=1\b/.test(location.search) ||
      (window.localStorage && localStorage.getItem('signDiag') === '1');
  } catch (_) { /* storage blocked — stay disabled */ }

  var noop = function () {};
  if (!enabled) {
    window.SignDiag = { enabled: false, frame: noop, payload: noop, event: noop, dump: noop, summary: noop };
    return;
  }

  var MAX_PAYLOAD_FRAMES = 150;   // rolling buffer of exact sent frames (~3MB JSON)
  var MAX_EVENTS = 200;

  var state = {
    startedAt: Date.now(),
    frames: 0,                    // onResults callbacks seen
    framesWithLeft: 0,
    framesWithRight: 0,
    framesWithPose: 0,
    framesWithFace: 0,
    framesWithAnyHand: 0,
    payloadsSent: 0,
    payloadFrames: [],            // rolling [{t, module, frame}] of EXACT sent frames
    events: [],
    fpsWindow: [],                // timestamps of recent frames for FPS
    lastEvent: '',
  };

  function pct(n) { return state.frames ? Math.round(100 * n / state.frames) : 0; }

  function fps() {
    var now = performance.now();
    state.fpsWindow.push(now);
    while (state.fpsWindow.length && now - state.fpsWindow[0] > 3000) state.fpsWindow.shift();
  }

  function currentFps() {
    if (state.fpsWindow.length < 2) return 0;
    var span = state.fpsWindow[state.fpsWindow.length - 1] - state.fpsWindow[0];
    return span > 0 ? Math.round(1000 * (state.fpsWindow.length - 1) / span) : 0;
  }

  // ── HUD ──────────────────────────────────────────────────────
  var hud = null, hudBody = null;
  function ensureHud() {
    if (hud || !document.body) return;
    hud = document.createElement('div');
    hud.setAttribute('dir', 'ltr');
    hud.style.cssText = 'position:fixed;z-index:99999;bottom:12px;left:12px;background:rgba(10,12,18,.92);' +
      'color:#8ff5c9;font:11px/1.5 monospace;padding:8px 10px;border-radius:8px;border:1px solid #2a2f3a;' +
      'pointer-events:auto;max-width:280px;white-space:pre;';
    hudBody = document.createElement('div');
    hud.appendChild(hudBody);
    var btn = document.createElement('button');
    btn.textContent = 'download diag dump';
    btn.style.cssText = 'margin-top:6px;font:10px monospace;padding:2px 6px;cursor:pointer;';
    btn.addEventListener('click', function () { window.SignDiag.dump(); });
    hud.appendChild(btn);
    document.body.appendChild(hud);
  }

  function renderHud() {
    ensureHud();
    if (!hudBody) return;
    hudBody.textContent =
      'SignDiag  fps:' + currentFps() +
      '\nframes:' + state.frames +
      '  sent:' + state.payloadsSent +
      '\nL:' + pct(state.framesWithLeft) + '%  R:' + pct(state.framesWithRight) +
      '%  any:' + pct(state.framesWithAnyHand) + '%' +
      '\npose:' + pct(state.framesWithPose) + '%  face:' + pct(state.framesWithFace) + '%' +
      '\nlast: ' + (state.lastEvent || '—');
  }

  var hudTimer = setInterval(renderHud, 500);

  // ── hooks ────────────────────────────────────────────────────
  function frame(results) {
    try {
      state.frames++;
      fps();
      if (results) {
        if (results.leftHandLandmarks) state.framesWithLeft++;
        if (results.rightHandLandmarks) state.framesWithRight++;
        if (results.leftHandLandmarks || results.rightHandLandmarks) state.framesWithAnyHand++;
        if (results.poseLandmarks) state.framesWithPose++;
        if (results.faceLandmarks) state.framesWithFace++;
      }
    } catch (_) {}
  }

  function payload(module, frames, meta) {
    try {
      state.payloadsSent++;
      var arr = Array.isArray(frames) && Array.isArray(frames[0]) && Array.isArray(frames[0][0])
        ? frames            // window of frames
        : [frames];         // single frame
      for (var i = 0; i < arr.length; i++) {
        state.payloadFrames.push({ t: Date.now(), module: module, meta: meta || null, frame: arr[i] });
        if (state.payloadFrames.length > MAX_PAYLOAD_FRAMES) state.payloadFrames.shift();
      }
    } catch (_) {}
  }

  function event(module, kind, data) {
    try {
      state.events.push({ t: Date.now(), module: module, kind: kind, data: data });
      if (state.events.length > MAX_EVENTS) state.events.shift();
      if (kind === 'sign_detected' && data && data.word) {
        state.lastEvent = data.word + ' @' + (data.confidence != null ? Number(data.confidence).toFixed(2) : '?');
      }
    } catch (_) {}
  }

  function summary() {
    return {
      startedAt: state.startedAt,
      durationMs: Date.now() - state.startedAt,
      url: location.pathname + location.search,
      userAgent: navigator.userAgent,
      frames: state.frames,
      fps: currentFps(),
      pctLeftHand: pct(state.framesWithLeft),
      pctRightHand: pct(state.framesWithRight),
      pctAnyHand: pct(state.framesWithAnyHand),
      pctPose: pct(state.framesWithPose),
      pctFace: pct(state.framesWithFace),
      payloadsSent: state.payloadsSent,
    };
  }

  function dump() {
    try {
      var blob = new Blob([JSON.stringify({
        summary: summary(),
        events: state.events,
        payloadFrames: state.payloadFrames,
      })], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sign-diag-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { console.error('[SignDiag] dump failed:', e); }
  }

  window.SignDiag = {
    enabled: true,
    frame: frame,
    payload: payload,
    event: event,
    dump: dump,
    summary: summary,
    _state: state,
    _stopHud: function () { clearInterval(hudTimer); if (hud) hud.remove(); },
  };
  console.log('[SignDiag] enabled — call SignDiag.dump() or use the HUD button to save a replayable dump.');
})();
