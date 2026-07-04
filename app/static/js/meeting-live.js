/* MeetLive — the live-meeting (SignLine) experience layer, shared by BOTH
 * dashboards (index.html / index_ar.html).
 *
 * The WebRTC mesh + socket.io signaling protocol proved reliable and stays in
 * the page (createPeer / joinMeeting / offer-answer glare handling). This file
 * owns everything the USER experiences on top of that transport:
 *
 *   - attributed live captions (who said/signed what, when) + subtitle overlay
 *   - the signer's pending-gloss chips (wrapping, tap-to-remove) + a live
 *     "✋ NAME is signing…" line on every other participant via the
 *     'meeting_gloss' relay
 *   - presence toasts (joined / left) + per-tile "connection interrupted"
 *     overlays driven by track mute/end and pc.connectionState — a closed
 *     laptop no longer looks like a frozen peer
 *   - the meeting microphone: device picker + live level meter; English uses
 *     continuous SpeechRecognition, Arabic (and any non-default device)
 *     records push-to-talk and transcribes via /api/stt
 *   - spoken captions via the page's playLocalTts (browser voice with Gemini
 *     backend fallback — Arabic finally speaks instead of text-only)
 *   - the speaker→sign avatar: its own tile in the video grid (no longer
 *     overlaying the local camera), with a sentence QUEUE (previous behavior
 *     silently dropped sentences that arrived while one was playing), word
 *     label + progress bar
 *   - a model indicator chip: which recognition model (ASL/ArSL) the meeting
 *     is feeding, the landmark backend, and a live activity dot
 *
 * The page hands us its context once via MeetLive.init(opts) — everything
 * else is driven through the small hook surface the inline code calls.
 */
(function () {
  'use strict';

  // Language comes from init(opts.lang) — the AR dashboard does not set
  // dir/lang on <html>, so sniffing the document is not reliable. The
  // document check is only the pre-init fallback.
  var AR = (document.documentElement.getAttribute('dir') === 'rtl') ||
           (document.documentElement.lang || '').toLowerCase().startsWith('ar');

  var STRINGS_AR = {
    you: 'أنت',
    peer: 'مشارك',
    signer: 'مُشير',
    speaker: 'متحدث',
    joined: 'انضم إلى الاجتماع',
    left: 'غادر الاجتماع',
    interrupted: 'انقطع الاتصال…',
    reconnecting: 'إعادة الاتصال…',
    isSigning: 'يقوم بالإشارة:',
    noSigns: 'لا توجد إشارات مُخزّنة — قم بالإشارة أمام الكاميرا',
    noMessages: 'لا توجد رسائل بعد.',
    micOff: '🔇 الميكروفون مغلق',
    micOn: '🎙️ الميكروفون يعمل',
    micRecording: '🔴 تسجيل… (اضغط للإرسال)',
    micTranscribing: 'جارٍ التفريغ…',
    micDenied: 'تم رفض إذن الميكروفون',
    micDevice: 'الميكروفون',
    defaultMic: 'الميكروفون الافتراضي',
    speechOutOn: '🔊 قراءة الترجمة',
    speechOutOff: '🔇 نص فقط',
    avatarTile: 'المتحدث ← إشارة',
    avatarMissing: 'لا توجد إشارة لـ:',
    modelAsl: 'نموذج ASL (إنجليزي)',
    modelArsl: 'نموذج ArSL (عربي)',
    modelEgsl: 'نموذج EgSL (مصري)',
    signLangLabel: 'لغة الإشارة',
    corrected: 'تم التصحيح',
    edit: 'تعديل',
  };
  var STRINGS_EN = {
    you: 'You',
    peer: 'Peer',
    signer: 'Signer',
    speaker: 'Speaker',
    joined: 'joined the meeting',
    left: 'left the meeting',
    interrupted: 'Connection interrupted…',
    reconnecting: 'Reconnecting…',
    isSigning: 'is signing:',
    noSigns: 'No signs buffered — sign at the camera',
    noMessages: 'No messages yet.',
    micOff: '🔇 Mic Off',
    micOn: '🎙️ Mic On',
    micRecording: '🔴 Recording… (press to send)',
    micTranscribing: 'Transcribing…',
    micDenied: 'Microphone permission denied',
    micDevice: 'Microphone',
    defaultMic: 'Default microphone',
    speechOutOn: '🔊 Read captions',
    speechOutOff: '🔇 Captions only',
    avatarTile: 'Speaker → Sign',
    avatarMissing: 'No sign clip for:',
    modelAsl: 'ASL model (English)',
    modelArsl: 'ArSL model (Arabic)',
    modelEgsl: 'EgSL model (Egyptian)',
    signLangLabel: 'Sign language',
    corrected: 'corrected',
    edit: 'Edit',
  };
  var S = AR ? STRINGS_AR : STRINGS_EN;

  var opts = null;              // page context, set by init()
  var peerNames = {};           // sid -> {name, role} survives peer removal (for "X left")
  var speechOut = false;
  var captions = [];            // {time, name, role, text, mine, sid}
  var CAPTION_MAX = 120;

  // ── tiny helpers ──────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function roleLabel(role) {
    var r = String(role || '').toLowerCase();
    if (r.indexOf('speak') >= 0) return S.speaker;
    if (r) return S.signer;
    return '';
  }
  function roleClass(role) {
    return String(role || '').toLowerCase().indexOf('speak') >= 0 ? 'ml-role--speaker' : 'ml-role--signer';
  }
  function nameFor(sid, fallbackName) {
    if (fallbackName) return fallbackName;
    var peers = opts.getPeers() || {};
    if (sid && peers[sid] && peers[sid].name) return peers[sid].name;
    if (sid && peerNames[sid] && peerNames[sid].name) return peerNames[sid].name;
    return S.peer;
  }
  function roleFor(sid, fallbackRole) {
    if (fallbackRole) return fallbackRole;
    var peers = opts.getPeers() || {};
    if (sid && peers[sid] && peers[sid].role) return peers[sid].role;
    if (sid && peerNames[sid] && peerNames[sid].role) return peerNames[sid].role;
    return '';
  }
  function fmtTime() {
    try { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch (_) { return ''; }
  }

  // ── styles ────────────────────────────────────────────────────
  function injectCss() {
    if ($('meet-live-css')) return;
    var css = [
      /* the legacy avatar overlay sat on TOP of the local camera tile */
      '#meeting-avatar-corner{display:none !important}',
      /* wrapping gloss chips (the old preview was one nowrap ellipsized line) */
      '#meeting-gloss-preview{white-space:normal !important;overflow:visible !important;display:flex;flex-wrap:wrap;gap:4px;align-items:center;min-height:26px}',
      '.ml-toast-wrap{position:absolute;bottom:64px;inset-inline:0;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:30;pointer-events:none}',
      '.ml-toast{background:rgba(10,12,16,.88);color:#fff;font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:0;transform:translateY(6px);transition:opacity .2s,transform .2s}',
      '.ml-toast.on{opacity:1;transform:none}',
      '.ml-cap-row{display:flex;gap:8px;align-items:flex-start;padding:7px 2px;border-bottom:1px solid var(--border)}',
      '.ml-cap-row:last-child{border-bottom:none}',
      '.ml-cap-meta{display:flex;flex-direction:column;gap:2px;flex:none;min-width:64px;max-width:96px}',
      '.ml-cap-name{font-size:11.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ml-cap-sub{display:flex;gap:4px;align-items:center}',
      '.ml-cap-time{font-size:9.5px;color:var(--faint);font-family:var(--font-mono)}',
      '.ml-role{font-size:9px;font-weight:800;letter-spacing:.04em;padding:1px 6px;border-radius:999px;text-transform:uppercase}',
      '.ml-role--signer{background:var(--accent-soft,rgba(31,138,130,.15));color:var(--accent,#1f8a82)}',
      '.ml-role--speaker{background:rgba(96,165,250,.14);color:#60a5fa}',
      '.ml-cap-text{flex:1;font-size:13.5px;line-height:1.5;color:var(--text);word-break:break-word}',
      '.ml-cap-row.mine .ml-cap-text{color:var(--muted)}',
      '.ml-cap-edit{flex:none;border:none;background:transparent;color:var(--faint);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:6px}',
      '.ml-cap-edit:hover{color:var(--text);background:var(--surface-2)}',
      '.ml-remote-gloss{display:none;align-items:center;gap:6px;flex-wrap:wrap;background:var(--surface-2);border:1px dashed var(--border);border-radius:10px;padding:7px 10px;margin-bottom:8px;font-size:12.5px;color:var(--muted)}',
      '.ml-remote-gloss.on{display:flex}',
      '.ml-remote-gloss b{color:var(--text);font-size:12px}',
      '.ml-rg-word{background:var(--accent-soft,rgba(31,138,130,.15));color:var(--accent,#1f8a82);font-weight:700;font-size:12px;padding:2px 8px;border-radius:999px}',
      '.ml-tile-note{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(8,10,14,.72);color:#fff;font-size:13px;font-weight:700;z-index:6;text-align:center;padding:10px}',
      '.ml-tile-note .ml-spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:mlspin .9s linear infinite}',
      '@keyframes mlspin{to{transform:rotate(360deg)}}',
      '.ml-chip{display:inline-flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:5px 12px;font-size:11.5px;font-weight:700;color:var(--muted)}',
      '.ml-chip .ml-dot{width:7px;height:7px;border-radius:50%;background:var(--faint);flex:none;transition:background .15s}',
      '.ml-chip.live .ml-dot{background:#f59e0b}',
      '.ml-chip.hit .ml-dot{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25)}',
      '.ml-mic-meter{width:64px;height:26px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);flex:none;display:none}',
      '.ml-mic-meter.on{display:block}',
      '.ml-mic-sel{max-width:180px;display:none}',
      '.ml-mic-sel.on{display:inline-block}',
      '.ml-avatar-tile{position:relative;background:var(--surface-2);aspect-ratio:4/3;max-height:min(52vh,460px);overflow:hidden}',
      '.ml-avatar-tile canvas{width:100%;height:100%;object-fit:contain;background:radial-gradient(circle at 50% 30%,rgba(31,138,130,.18),transparent 70%)}',
      '.ml-avatar-word{position:absolute;bottom:12px;inset-inline:0;text-align:center;color:#fff;font-weight:800;font-size:16px;text-shadow:0 2px 8px rgba(0,0,0,.7);letter-spacing:.04em}',
      '.ml-avatar-q{position:absolute;top:10px;inset-inline-end:10px;background:rgba(0,0,0,.55);color:#fff;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px}',
      '.ml-avatar-bar{position:absolute;bottom:0;inset-inline-start:0;height:3px;background:var(--accent,#1f8a82);width:0%}',
      '#meeting-caption-history{max-height:none}',
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'meet-live-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ── toasts ────────────────────────────────────────────────────
  var toastWrap = null;
  function ensureToastWrap() {
    if (toastWrap && toastWrap.isConnected) return toastWrap;
    var stageBox = document.querySelector('.d-meet-videos');
    var host = stageBox ? stageBox.parentElement : document.querySelector('.d-meet');
    if (!host) return null;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    toastWrap = el('div', 'ml-toast-wrap');
    host.appendChild(toastWrap);
    return toastWrap;
  }
  function toast(msg) {
    var wrap = ensureToastWrap();
    if (!wrap) return;
    var t = el('div', 'ml-toast', msg);
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); }, 3400);
    setTimeout(function () { t.remove(); }, 3800);
  }

  // ── captions ──────────────────────────────────────────────────
  function captionHost() { return $('meeting-caption-history'); }

  function renderCaptions() {
    var host = captionHost();
    if (!host) return;
    host.textContent = '';
    if (!captions.length) {
      var ph = el('div', 'd-meet-remote-text', S.noMessages);
      ph.style.cssText = 'color:var(--faint);font-size:12px';
      host.appendChild(ph);
      return;
    }
    captions.forEach(function (c) {
      var row = el('div', 'ml-cap-row' + (c.mine ? ' mine' : ''));
      var meta = el('div', 'ml-cap-meta');
      meta.appendChild(el('div', 'ml-cap-name', c.mine ? S.you : c.name));
      var sub = el('div', 'ml-cap-sub');
      var rl = roleLabel(c.role);
      if (rl) sub.appendChild(el('span', 'ml-role ' + roleClass(c.role), rl));
      sub.appendChild(el('span', 'ml-cap-time', c.time));
      meta.appendChild(sub);
      row.appendChild(meta);
      var txt = el('div', 'ml-cap-text', c.text);
      row.appendChild(txt);
      if (c.mine) {
        var edit = el('button', 'ml-cap-edit', '✎');
        edit.title = S.edit;
        edit.addEventListener('click', function () { editCaption(c, txt); });
        row.appendChild(edit);
      }
      host.appendChild(row);
    });
    var box = host.parentElement;
    if (box) box.scrollTop = box.scrollHeight;
  }

  function editCaption(c, txtEl) {
    var input = document.createElement('input');
    input.className = 't-input';
    input.value = c.text;
    input.style.cssText = 'flex:1;font-size:13px;padding:4px 8px';
    var done = false;
    var save = function () {
      if (done) return; done = true;
      var v = (input.value || '').trim();
      if (v && v !== c.text) {
        c.text = v;
        var sock = opts.getSocket();
        if (sock && sock.connected && opts.isInMeeting()) {
          sock.emit('translate_sentence', {
            text: v, room: opts.getRoom(), mode: 'correction',
            senderRole: opts.getRole(), senderName: opts.getDisplayName(),
          });
        }
      }
      renderCaptions();
    };
    input.onkeydown = function (e) {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') { done = true; renderCaptions(); }
    };
    input.onblur = save;
    txtEl.replaceWith(input);
    input.focus();
  }

  function setOverlay(name, text) {
    var overlay = $('meeting-subtitle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.textContent = name ? (name + ': ' + text) : text;
    overlay.style.color = '#fff';
  }

  function addCaption(p) {
    // p: {text, senderSid, senderName, senderRole, localEcho}
    var text = (p && p.text != null ? String(p.text) : '').trim();
    if (!text) return;
    var mine = !!p.localEcho;
    var name = mine ? opts.getDisplayName() : nameFor(p.senderSid, p.senderName);
    var role = mine ? opts.getRole() : roleFor(p.senderSid, p.senderRole);
    captions.push({ time: fmtTime(), name: name, role: role, text: text, mine: mine, sid: p.senderSid || null });
    if (captions.length > CAPTION_MAX) captions.shift();
    renderCaptions();
    setOverlay(mine ? S.you : name, text);

    if (!mine) {
      // a full sentence supersedes the live word-stream from that signer
      if (p.senderSid) hideRemoteGloss(p.senderSid);
      var senderIsSpeaker = String(role || '').toLowerCase().indexOf('speak') >= 0;
      if (opts.isSigner() && senderIsSpeaker) enqueueAvatar(text);
      if (speechOut) {
        try { opts.playTts(text, AR ? 'arabic' : 'english'); } catch (_) {}
      }
    }
  }

  // ── local gloss (signer's pending words) ──────────────────────
  function glossBuf() {
    if (!Array.isArray(window.__meetGlossBuf)) window.__meetGlossBuf = [];
    return window.__meetGlossBuf;
  }

  var glossEmitTimer = null;
  function emitGloss() {
    if (glossEmitTimer) return;
    glossEmitTimer = setTimeout(function () {
      glossEmitTimer = null;
      var sock = opts.getSocket();
      if (!sock || !sock.connected || !opts.isInMeeting()) return;
      sock.emit('meeting_gloss', {
        room: opts.getRoom(),
        words: glossBuf().slice(-12),
        name: opts.getDisplayName(),
        role: opts.getRole(),
      });
    }, 350);
  }

  function renderLocalGloss() {
    var elp = $('meeting-gloss-preview');
    if (elp) {
      // neutralize the legacy one-line inline styles once
      elp.style.whiteSpace = 'normal';
      elp.style.overflow = 'visible';
      elp.style.textOverflow = '';
      var buf = glossBuf();
      elp.textContent = '';
      if (!buf.length) {
        var ph = el('span', null, S.noSigns);
        ph.style.cssText = 'color:var(--faint);font-size:11.5px';
        elp.appendChild(ph);
      } else {
        buf.forEach(function (w, i) {
          var chip = el('button', 'd-gloss-chip');
          chip.type = 'button';
          var t = el('span', null, w);
          var x = el('span', 'x', '×');
          chip.append(t, x);
          chip.addEventListener('click', function () {
            buf.splice(i, 1);
            renderLocalGloss();
            emitGloss();
          });
          elp.appendChild(chip);
        });
      }
    }
    var cbtn = $('meeting-compose-btn');
    if (cbtn) cbtn.disabled = glossBuf().length === 0;
  }

  function onLocalSign(word) {
    glossBuf().push(word);
    renderLocalGloss();
    emitGloss();
  }

  function clearLocalGloss() {
    window.__meetGlossBuf = [];
    renderLocalGloss();
    emitGloss();
  }

  // ── remote gloss line ("✋ NAME is signing: …") ────────────────
  var rgTimers = {};
  function remoteGlossHost() {
    var host = $('ml-remote-gloss');
    if (host) return host;
    var capLabel = $('meeting-caption-label');
    if (!capLabel || !capLabel.parentElement) return null;
    host = el('div', 'ml-remote-gloss');
    host.id = 'ml-remote-gloss';
    capLabel.parentElement.insertBefore(host, capLabel.nextSibling);
    return host;
  }
  function onRemoteGloss(data) {
    var sid = data && data.sender_sid;
    var words = (data && Array.isArray(data.words)) ? data.words : [];
    var host = remoteGlossHost();
    if (!host) return;
    if (!words.length) { hideRemoteGloss(sid); return; }
    host.classList.add('on');
    host.textContent = '';
    host.appendChild(el('span', null, '✋'));
    var who = el('b', null, nameFor(sid, data && data.name) + ' ' + S.isSigning);
    host.appendChild(who);
    words.slice(-8).forEach(function (w) { host.appendChild(el('span', 'ml-rg-word', w)); });
    if (rgTimers[sid]) clearTimeout(rgTimers[sid]);
    rgTimers[sid] = setTimeout(function () { hideRemoteGloss(sid); }, 8000);
  }
  function hideRemoteGloss(sid) {
    var host = $('ml-remote-gloss');
    if (host) { host.classList.remove('on'); host.textContent = ''; }
    if (sid && rgTimers[sid]) { clearTimeout(rgTimers[sid]); delete rgTimers[sid]; }
  }

  // ── presence + tile interruption overlays ─────────────────────
  function onPeerNamed(sid) {
    var peers = opts.getPeers() || {};
    var e = peers[sid];
    if (!e || !e.name) return;
    var first = !peerNames[sid];
    peerNames[sid] = { name: e.name, role: e.role };
    if (first) toast(e.name + (roleLabel(e.role) ? ' (' + roleLabel(e.role) + ') ' : ' ') + S.joined);
  }

  function onPeerLeft(sid) {
    var known = peerNames[sid];
    toast((known && known.name ? known.name : S.peer) + ' ' + S.left);
    hideRemoteGloss(sid);
    delete peerNames[sid];
    // Last peer gone → clear the stale subtitle overlay (it kept showing the
    // final caption under a "Waiting for peer" stage).
    setTimeout(function () {
      var peers = opts.getPeers() || {};
      if (!Object.keys(peers).length) {
        var overlay = $('meeting-subtitle-overlay');
        if (overlay) overlay.textContent = '';
      }
    }, 50);
  }

  function tileNote(sid, show, msg) {
    var tile = document.getElementById('remote-tile-' + String(sid || '').replace(/[^A-Za-z0-9_-]/g, '_'));
    if (!tile) return;
    var note = tile.querySelector('.ml-tile-note');
    if (show) {
      if (!note) {
        note = el('div', 'ml-tile-note');
        note.appendChild(el('div', 'ml-spin'));
        note.appendChild(el('div', 'ml-tile-note-msg', msg || S.interrupted));
        tile.appendChild(note);
      } else {
        var m = note.querySelector('.ml-tile-note-msg');
        if (m) m.textContent = msg || S.interrupted;
      }
    } else if (note) {
      note.remove();
    }
  }

  function watchTile(sid, videoEl, pc) {
    if (!videoEl || videoEl.__mlWatched) return;
    videoEl.__mlWatched = true;
    function bindTracks() {
      var stream = videoEl.srcObject;
      if (!stream || !stream.getVideoTracks) return;
      stream.getVideoTracks().forEach(function (tr) {
        if (tr.__mlBound) return;
        tr.__mlBound = true;
        tr.addEventListener('mute', function () { tileNote(sid, true, S.interrupted); });
        tr.addEventListener('unmute', function () { tileNote(sid, false); });
        tr.addEventListener('ended', function () { tileNote(sid, true, S.interrupted); });
      });
    }
    bindTracks();
    videoEl.addEventListener('loadedmetadata', bindTracks);
    if (pc && !pc.__mlWatched) {
      pc.__mlWatched = true;
      pc.addEventListener('connectionstatechange', function () {
        if (pc.connectionState === 'disconnected') tileNote(sid, true, S.reconnecting);
        else if (pc.connectionState === 'connected') tileNote(sid, false);
      });
    }
  }

  // ── model indicator chip + meeting sign-language picker ───────
  var chipEl = null, chipTimer = null;
  function modelChipText() {
    var sel = opts.getCamLangSelect();
    var v = sel ? sel.value : (AR ? 'arabic' : 'english');
    if (v === 'arabic') return S.modelArsl;
    if (v === 'egyptian') return S.modelEgsl;
    return S.modelAsl;
  }
  function ensureIndicators() {
    var stageLabel = $('meeting-stage-label');
    if (!stageLabel || !stageLabel.parentElement) return;
    if (!chipEl) {
      chipEl = el('span', 'ml-chip');
      chipEl.id = 'ml-model-chip';
      chipEl.appendChild(el('span', 'ml-dot'));
      chipEl.appendChild(el('span', 'ml-chip-txt', modelChipText()));
      chipEl.title = (window.__landmarkEngineBackend || '');
      stageLabel.parentElement.insertBefore(chipEl, stageLabel);
    }
    // signer-only: a sign-language picker that mirrors the dashboard's picker
    var camSel = opts.getCamLangSelect();
    if (camSel && opts.isSigner() && !$('ml-sign-lang')) {
      var sel = document.createElement('select');
      sel.id = 'ml-sign-lang';
      sel.className = 'd-lang-sel';
      sel.style.cssText = 'padding:4px 8px;font-size:12px;max-width:150px;margin-inline-end:8px';
      sel.setAttribute('aria-label', S.signLangLabel);
      Array.prototype.forEach.call(camSel.options, function (o) {
        var c = document.createElement('option');
        c.value = o.value; c.textContent = o.textContent;
        sel.appendChild(c);
      });
      sel.value = camSel.value;
      sel.addEventListener('change', function () {
        camSel.value = sel.value;
        camSel.dispatchEvent(new Event('change'));
        updateChip();
      });
      camSel.addEventListener('change', function () {
        sel.value = camSel.value;
        updateChip();
      });
      chipEl.parentElement.insertBefore(sel, chipEl);
    }
    updateChip();
  }
  function updateChip() {
    if (!chipEl) return;
    var t = chipEl.querySelector('.ml-chip-txt');
    if (t) t.textContent = modelChipText();
    chipEl.title = 'landmarks: ' + (window.__landmarkEngineBackend || 'n/a');
  }
  function noteSignEvent(kind) {
    if (!chipEl) return;
    chipEl.classList.add('live');
    if (kind === 'detected') {
      chipEl.classList.add('hit');
      setTimeout(function () { chipEl && chipEl.classList.remove('hit'); }, 600);
    }
    if (chipTimer) clearTimeout(chipTimer);
    chipTimer = setTimeout(function () { chipEl && chipEl.classList.remove('live'); }, 2500);
  }

  // ── microphone: picker + meter + capture ──────────────────────
  var micOn = false, micRec = null, micMediaRec = null, micChunks = [];
  var meterCtx = null, meterAnalyser = null, meterRAF = null, meterStream = null;
  var micSelEl = null, micMeterEl = null;

  function micBtn() { return $('meeting-mic-btn'); }
  function chosenMicId() {
    try { return localStorage.getItem('meeting-mic-device') || ''; } catch (_) { return ''; }
  }

  function ensureMicUi() {
    var btn = micBtn();
    if (!btn || $('ml-mic-meter')) return;
    micMeterEl = document.createElement('canvas');
    micMeterEl.id = 'ml-mic-meter';
    micMeterEl.className = 'ml-mic-meter';
    micMeterEl.width = 128; micMeterEl.height = 52;
    btn.insertAdjacentElement('afterend', micMeterEl);

    micSelEl = document.createElement('select');
    micSelEl.id = 'ml-mic-sel';
    micSelEl.className = 'd-lang-sel ml-mic-sel';
    micSelEl.setAttribute('aria-label', S.micDevice);
    micSelEl.addEventListener('change', function () {
      try { localStorage.setItem('meeting-mic-device', micSelEl.value); } catch (_) {}
      if (micOn) { stopMic(); startMic(); } // hot-swap device
    });
    micMeterEl.insertAdjacentElement('afterend', micSelEl);

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(function (devs) {
        var mics = devs.filter(function (d) { return d.kind === 'audioinput'; });
        if (mics.length < 2) return; // nothing to pick
        micSelEl.textContent = '';
        var d0 = document.createElement('option');
        d0.value = ''; d0.textContent = S.defaultMic;
        micSelEl.appendChild(d0);
        mics.forEach(function (d, i) {
          var o = document.createElement('option');
          o.value = d.deviceId;
          o.textContent = d.label || (S.micDevice + ' ' + (i + 1));
          micSelEl.appendChild(o);
        });
        micSelEl.value = chosenMicId();
        if (micSelEl.value !== chosenMicId()) micSelEl.value = '';
        micSelEl.classList.add('on');
      }).catch(function () {});
    }
  }

  function startMeter(stream) {
    stopMeter(false);
    try {
      meterCtx = new (window.AudioContext || window.webkitAudioContext)();
      var src = meterCtx.createMediaStreamSource(stream);
      meterAnalyser = meterCtx.createAnalyser();
      meterAnalyser.fftSize = 256;
      src.connect(meterAnalyser);
      var data = new Uint8Array(meterAnalyser.frequencyBinCount);
      var cv = micMeterEl, c2 = cv.getContext('2d');
      cv.classList.add('on');
      var accent = '#22c55e';
      var tick = function () {
        if (!meterAnalyser) return;
        meterAnalyser.getByteFrequencyData(data);
        c2.clearRect(0, 0, cv.width, cv.height);
        var bars = 16, step = Math.floor(data.length / bars);
        for (var i = 0; i < bars; i++) {
          var v = data[i * step] / 255;
          var h = Math.max(2, v * cv.height);
          c2.fillStyle = v > 0.75 ? '#f59e0b' : accent;
          c2.fillRect(i * (cv.width / bars) + 1, cv.height - h, (cv.width / bars) - 2, h);
        }
        meterRAF = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { /* meter is best-effort */ }
  }
  function stopMeter(hide) {
    if (meterRAF) cancelAnimationFrame(meterRAF);
    meterRAF = null; meterAnalyser = null;
    if (meterCtx) { try { meterCtx.close(); } catch (_) {} meterCtx = null; }
    if (meterStream) { meterStream.getTracks().forEach(function (t) { t.stop(); }); meterStream = null; }
    if (micMeterEl && hide !== false) micMeterEl.classList.remove('on');
  }

  function sendCaption(text, mode) {
    var sock = opts.getSocket();
    addCaption({ text: text, localEcho: true });
    if (sock && sock.connected && opts.isInMeeting()) {
      sock.emit('translate_sentence', {
        text: text, room: opts.getRoom(), mode: mode,
        senderRole: opts.getRole(), senderName: opts.getDisplayName(),
      });
    }
  }

  function setMicButton(state) {
    var btn = micBtn();
    if (!btn) return;
    btn.classList.remove('on');
    btn.style.background = ''; btn.style.color = '';
    if (state === 'on') { btn.textContent = S.micOn; btn.classList.add('on'); }
    else if (state === 'rec') {
      btn.textContent = S.micRecording;
      btn.style.background = 'rgba(220,50,50,.22)'; btn.style.color = '#ff6b6b';
    } else btn.textContent = S.micOff;
  }

  function micConstraints() {
    var id = micSelEl ? micSelEl.value : chosenMicId();
    return id ? { audio: { deviceId: { exact: id } } } : { audio: true };
  }

  // Push-to-talk MediaRecorder → /api/stt. Used for Arabic always, and for
  // English when a specific (non-default) input device is selected —
  // SpeechRecognition can only listen on the OS default device.
  async function startRecorder(language) {
    var stream;
    try { stream = await navigator.mediaDevices.getUserMedia(micConstraints()); }
    catch (e) { opts.setStatus(S.micDenied, false); return false; }
    meterStream = stream;
    startMeter(stream);
    micChunks = [];
    micMediaRec = new MediaRecorder(stream);
    micMediaRec.ondataavailable = function (e) { if (e.data.size > 0) micChunks.push(e.data); };
    micMediaRec.onstop = async function () {
      stopMeter();
      stream.getTracks().forEach(function (t) { t.stop(); });
      if (meterStream === stream) meterStream = null;
      var blob = new Blob(micChunks, { type: 'audio/webm' });
      micChunks = [];
      micMediaRec = null;
      if (!blob.size) { setMicButton('off'); return; }
      opts.setStatus(S.micTranscribing, true);
      try {
        var fd = new FormData();
        fd.append('file', blob, 'meeting_speech.webm');
        fd.append('language', language);
        var res = await opts.authFetch('/api/stt', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('stt ' + res.status);
        var data = await res.json();
        var text = (data.text || '').trim();
        if (text) sendCaption(text, 'speaker_speech');
        else opts.setStatus(AR ? 'لم يُكتشف كلام' : 'No speech detected', false);
      } catch (err) {
        opts.setStatus(AR ? 'خطأ في التفريغ' : 'Transcription error', false);
      } finally {
        setMicButton('off');
      }
    };
    micMediaRec.start();
    setMicButton('rec');
    return true;
  }

  async function startMic() {
    var useRecorder = AR || (micSelEl && micSelEl.value);
    if (useRecorder) {
      var ok = await startRecorder(AR ? 'arabic' : 'english');
      micOn = !!ok;
      return;
    }

    // English on the default device → continuous SpeechRecognition
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // no SR in this browser → fall back to push-to-talk
      var ok2 = await startRecorder('english');
      micOn = !!ok2;
      return;
    }
    // a parallel monitor stream feeds the level meter (SR exposes no audio)
    try {
      meterStream = await navigator.mediaDevices.getUserMedia(micConstraints());
      startMeter(meterStream);
    } catch (_) { /* SR may still work */ }

    micRec = new SR();
    micRec.continuous = true;
    micRec.interimResults = false;
    micRec.lang = navigator.language || 'en-US';
    micRec.onresult = function (e) {
      for (var i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          var text = e.results[i][0].transcript.trim();
          if (text) sendCaption(text, 'speaker_speech');
        }
      }
    };
    var FATAL = { 'not-allowed': 1, 'service-not-allowed': 1, 'bad-grammar': 1, 'language-not-supported': 1 };
    micRec.onerror = function (e) {
      if (FATAL[e.error]) { stopMic(); opts.setStatus(S.micDenied + ' (' + e.error + ')', false); }
    };
    micRec.onend = function () {
      if (micOn && micRec) {
        try { micRec.start(); } catch (err) {
          if (String(err && err.name) !== 'InvalidStateError') stopMic();
        }
      }
    };
    try { micRec.start(); micOn = true; setMicButton('on'); }
    catch (_) { stopMic(); opts.setStatus(AR ? 'الميكروفون مشغول' : 'Mic busy — press again', false); }
  }

  function stopMic() {
    micOn = false;
    if (micRec) { try { micRec.stop(); } catch (_) {} micRec = null; }
    if (micMediaRec && micMediaRec.state !== 'inactive') {
      try { micMediaRec.stop(); } catch (_) {} // onstop finishes transcription
      return; // button state handled by onstop
    }
    micMediaRec = null;
    stopMeter();
    setMicButton('off');
  }

  async function toggleMic() {
    if (!opts.isInMeeting()) { opts.setStatus(AR ? 'انضم إلى اجتماع أولاً' : 'Join meeting first', false); return; }
    ensureMicUi();
    if (micOn || (micMediaRec && micMediaRec.state !== 'inactive')) stopMic();
    else await startMic();
  }

  // ── speech-out (read incoming captions aloud) ─────────────────
  function toggleSpeechOut() {
    speechOut = !speechOut;
    var btn = $('meeting-speech-out-btn');
    if (btn) {
      btn.classList.toggle('on', speechOut);
      btn.textContent = speechOut ? S.speechOutOn : S.speechOutOff;
    }
    return speechOut;
  }

  // ── avatar: dedicated tile + sentence queue ───────────────────
  var avatarQueue = [];
  var avatarBusy = false;
  var avatarHideTimer = null;

  function avatarTile() {
    var tile = $('ml-avatar-tile');
    if (tile) return tile;
    var grid = $('meeting-remote-tiles');
    if (!grid) return null;
    tile = el('div', 'd-meet-vid-wrap ml-avatar-tile');
    tile.id = 'ml-avatar-tile';
    tile.style.display = 'none';
    var cv = document.createElement('canvas');
    cv.id = 'ml-avatar-canvas';
    cv.width = 440; cv.height = 330;
    tile.appendChild(cv);
    var lbl = el('div', 'd-meet-vid-lbl', S.avatarTile);
    tile.appendChild(lbl);
    tile.appendChild(el('div', 'ml-avatar-word'));
    tile.appendChild(el('div', 'ml-avatar-q'));
    tile.appendChild(el('div', 'ml-avatar-bar'));
    grid.appendChild(tile);
    return tile;
  }

  function normalizeWords(text) {
    if (AR) {
      return String(text || '').replace(/[^؀-ۿ0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    }
    var out = [];
    String(text || '').toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean)
      .forEach(function (tok) {
        var c = tok.replace(/'/g, '');
        if (c === 'im') { out.push('i', 'am'); } else if (c) out.push(c);
      });
    return out;
  }

  function enqueueAvatar(text) {
    if (!text) return;
    avatarQueue.push(text);
    var tile = avatarTile();
    if (tile) {
      var q = tile.querySelector('.ml-avatar-q');
      if (q) q.textContent = avatarQueue.length > 1 ? ('+' + (avatarQueue.length - 1)) : '';
    }
    if (!avatarBusy) drainAvatar();
  }

  async function drainAvatar() {
    var tile = avatarTile();
    if (!tile) { avatarQueue = []; return; }
    avatarBusy = true;
    if (avatarHideTimer) { clearTimeout(avatarHideTimer); avatarHideTimer = null; }
    tile.style.display = '';
    var cv = tile.querySelector('canvas');
    var ctx = cv.getContext('2d');
    var wordEl = tile.querySelector('.ml-avatar-word');
    var qEl = tile.querySelector('.ml-avatar-q');
    var barEl = tile.querySelector('.ml-avatar-bar');
    try { opts.drawAvatar(ctx, null, cv.width, cv.height); } catch (_) {}

    while (avatarQueue.length) {
      var sentence = avatarQueue.shift();
      if (qEl) qEl.textContent = avatarQueue.length ? ('+' + avatarQueue.length) : '';
      var words = null;
      if (opts.sentenceToGloss) {
        try { words = await opts.sentenceToGloss(sentence, AR ? 'arabic' : 'english'); } catch (_) {}
      }
      if (!words || !words.length) words = normalizeWords(sentence);
      if (!words.length) continue;
      var data = null;
      try {
        var res = await opts.authFetch(opts.signBatchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words: words }),
        });
        if (res.ok) data = await res.json();
      } catch (_) {}
      if (!data || !data.found || !data.found.length) {
        opts.setStatus(S.avatarMissing + ' "' + sentence + '"', false);
        continue;
      }
      if (data.missing && data.missing.length) {
        opts.setStatus(S.avatarMissing + ' ' + data.missing.join(', '), false);
      }
      for (var wi = 0; wi < data.found.length; wi++) {
        var item = data.found[wi];
        var lms = item.landmarks || [];
        var n = item.frame_count || lms.length;
        if (wordEl) wordEl.textContent = item.word_ar || item.word || '';
        for (var f = 0; f < n; f++) {
          if (!avatarBusy) return; // torn down mid-play (leave)
          var flat = opts.flattenFrame(lms[f]);
          try { opts.drawAvatar(ctx, flat, cv.width, cv.height); } catch (_) {}
          if (barEl) barEl.style.width = Math.round(100 * f / Math.max(1, n - 1)) + '%';
          await new Promise(function (r) { setTimeout(r, 60); }); // deliberate slow pace
        }
        await new Promise(function (r) { setTimeout(r, 350); });
      }
      if (barEl) barEl.style.width = '0%';
    }
    if (wordEl) wordEl.textContent = '';
    avatarBusy = false;
    avatarHideTimer = setTimeout(function () {
      var t = $('ml-avatar-tile');
      if (t && !avatarBusy && !avatarQueue.length) t.style.display = 'none';
    }, 2000);
  }

  function resetAvatar() {
    avatarQueue = [];
    avatarBusy = false;
    if (avatarHideTimer) { clearTimeout(avatarHideTimer); avatarHideTimer = null; }
    var t = $('ml-avatar-tile');
    if (t) t.style.display = 'none';
  }

  // ── lifecycle ─────────────────────────────────────────────────
  function onJoined() {
    ensureIndicators();
    ensureMicUi();
    // The signer's role UI hides the mic button — hide its companions too.
    var micHidden = opts.isSigner();
    if (micSelEl) micSelEl.style.display = micHidden ? 'none' : '';
    if (micMeterEl) micMeterEl.style.display = micHidden ? 'none' : '';
    renderLocalGloss();
    renderCaptions();
  }

  function onLeave() {
    stopMic();
    resetAvatar();
    hideRemoteGloss();
    captions = [];
    clearLocalGloss();
    renderCaptions();
    peerNames = {};
    var sel = $('ml-sign-lang');
    if (sel) sel.remove();
    if (micSelEl) micSelEl.classList.remove('on');
    if (micMeterEl) micMeterEl.classList.remove('on');
  }

  // ── public API ────────────────────────────────────────────────
  window.MeetLive = {
    init: function (o) {
      opts = o;
      if (o && o.lang) {
        AR = String(o.lang).toLowerCase().startsWith('ar');
        S = AR ? STRINGS_AR : STRINGS_EN;
      }
      injectCss();
      renderCaptions();
    },
    ready: function () { return !!opts; },
    addCaption: addCaption,
    onLocalSign: onLocalSign,
    clearLocalGloss: clearLocalGloss,
    renderLocalGloss: renderLocalGloss,
    onRemoteGloss: onRemoteGloss,
    onPeerNamed: onPeerNamed,
    onPeerLeft: onPeerLeft,
    watchTile: watchTile,
    toggleMic: toggleMic,
    stopMic: stopMic,
    toggleSpeechOut: toggleSpeechOut,
    enqueueAvatar: enqueueAvatar,
    noteSignEvent: noteSignEvent,
    onJoined: onJoined,
    onLeave: onLeave,
    updateChip: updateChip,
  };
})();
