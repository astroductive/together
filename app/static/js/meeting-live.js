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
    composing: 'يقوم بتكوين الجملة…',
    avatarLoading: 'جارٍ تحميل الإشارات…',
    peerDead: 'انقطع اتصال المشارك',
    cameraOff: 'الكاميرا مغلقة',
    raiseHand: '✋ لفت الانتباه',
    handRaised: 'يطلب الانتباه!',
    exportTxt: 'تصدير النص',
    fontSize: 'حجم الخط',
    ptt: 'اضغط للتحدث',
    liveMic: 'ميكروفون مباشر',
    pttHint: 'اضغط مطولاً (مسافة) للتحدث',
    holdSpace: 'أمسك المسافة…',
    selfSkeleton: 'معاينتك',
    composingSelf: 'جارٍ التكوين…',
    autoComposeHint: 'تكوين تلقائي عند الراحة',
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
    composing: 'is composing a sentence…',
    avatarLoading: 'Loading signs…',
    peerDead: 'Participant connection lost',
    cameraOff: 'Camera off',
    raiseHand: '✋ Get attention',
    handRaised: 'wants your attention!',
    exportTxt: 'Export transcript',
    fontSize: 'Caption size',
    ptt: 'Push-to-talk',
    liveMic: 'Live mic',
    pttHint: 'Hold Space to talk',
    holdSpace: 'Hold Space…',
    selfSkeleton: 'Your preview',
    composingSelf: 'Composing…',
    autoComposeHint: 'Auto-compose on rest',
  };
  var S = AR ? STRINGS_AR : STRINGS_EN;

  // Text→sign and TTS pick their language from the TEXT itself, not the page:
  // a speaker on the English dashboard can type Arabic (and vice versa).
  function textIsArabic(text) { return /[؀-ۿ]/.test(String(text || '')); }
  var BATCH_URLS = { en: '/api/signs/batch', ar: '/api/signs_ar/batch' };

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
      '.ml-cap-sys{font-size:11.5px;color:var(--faint);font-style:italic;text-align:center;padding:5px 2px;border-bottom:1px dashed var(--border)}',
      '.ml-remote-gloss.composing .ml-rg-word{opacity:.55}',
      '.ml-rg-spin{width:12px;height:12px;border:2px solid var(--border);border-top-color:var(--accent,#1f8a82);border-radius:50%;animation:mlspin .9s linear infinite;flex:none}',
      'body.ml-in-meeting .d-aurora-bg{display:none !important}',
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
      '.ml-mic-sel{max-width:170px;display:none}',
      '.ml-mic-sel.on{display:inline-block}',
      '.ml-mic-mode{font-size:12px;padding:6px 10px;white-space:nowrap}',
      '.ml-mic-mode[aria-pressed="true"]{border-color:var(--accent,#1f8a82);color:var(--accent,#1f8a82)}',
      '.ml-ptt-hint{display:none;align-items:center;font-size:11px;font-weight:700;color:#f59e0b;gap:4px}',
      /* camera-off overlay on a peer tile (stopped WebRTC track freezes the last frame) */
      '.ml-cam-off{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--surface-2,#16161a);color:var(--faint);font-size:13px;font-weight:700;z-index:7}',
      '.ml-cam-off svg{width:34px;height:34px;opacity:.6}',
      /* raise-hand attention flash + banner */
      '@keyframes mlflash{0%,100%{box-shadow:inset 0 0 0 0 rgba(245,158,11,0)}50%{box-shadow:inset 0 0 0 5px rgba(245,158,11,.85)}}',
      '.ml-attn{animation:mlflash 0.55s ease-in-out 3}',
      '.ml-hand-banner{position:absolute;top:12px;inset-inline:0;display:flex;justify-content:center;z-index:31;pointer-events:none}',
      '.ml-hand-banner>span{background:#f59e0b;color:#1a1205;font-weight:800;font-size:13px;padding:7px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.4)}',
      /* caption font-size scale (set on the caption box via --ml-cap-scale) */
      '#meeting-caption-history{font-size:calc(13.5px*var(--ml-cap-scale,1))}',
      '#meeting-caption-history .ml-cap-text{font-size:1em}',
      '#meeting-subtitle-overlay{font-size:calc(15px*var(--ml-cap-scale,1)) !important}',
      '.ml-tools{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px}',
      '.ml-tool-btn{border:1px solid var(--border);background:var(--surface);color:var(--muted);border-radius:9px;cursor:pointer;font-size:12px;font-weight:700;padding:4px 9px;line-height:1}',
      '.ml-tool-btn:hover{color:var(--text);border-color:var(--accent,#1f8a82)}',
      '.ml-font-group{display:inline-flex;border:1px solid var(--border);border-radius:9px;overflow:hidden}',
      '.ml-font-group button{border:none;background:var(--surface);color:var(--muted);cursor:pointer;padding:4px 8px;font-weight:800;line-height:1}',
      '.ml-font-group button.on{background:var(--accent-soft,rgba(31,138,130,.15));color:var(--accent,#1f8a82)}',
      /* signer self-preview skeleton overlay on the local tile */
      '#ml-self-skel{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;transform:scaleX(-1)}',
      '.ml-self-tag{position:absolute;top:8px;inset-inline-start:8px;background:rgba(0,0,0,.5);color:#8ff5c9;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;z-index:7}',
      '.ml-stage-metric{font-size:11px;color:var(--faint);margin-inline-start:8px;font-variant-numeric:tabular-nums}',
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

  var editingActive = false;   // an open caption-edit input must survive re-renders
  var pendingRender = false;

  function renderCaptions() {
    if (editingActive) { pendingRender = true; return; }
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
      if (c.system) {
        var sysRow = el('div', 'ml-cap-sys', c.text);
        host.appendChild(sysRow);
        return;
      }
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
    editingActive = true;
    var finish = function () {
      editingActive = false;
      renderCaptions();
      if (pendingRender) { pendingRender = false; }
    };
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
      finish();
    };
    input.onkeydown = function (e) {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') { done = true; finish(); }
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
        try { opts.playTts(text, textIsArabic(text) ? 'arabic' : 'english'); } catch (_) {}
      }
    }
  }

  // Faint centered system rows in the caption feed ("word X not in dataset" etc.)
  function addSystemNote(text) {
    captions.push({ time: fmtTime(), system: true, text: text });
    if (captions.length > CAPTION_MAX) captions.shift();
    renderCaptions();
  }

  // Server replay of the room's recent captions (late join / rejoin). Only
  // applied onto an EMPTY panel — no TTS, no avatar, no gloss side effects.
  function onCaptionHistory(data) {
    var list = data && Array.isArray(data.captions) ? data.captions : [];
    if (!list.length || captions.length) return;
    list.forEach(function (p) {
      var text = (p && p.text != null ? String(p.text) : '').trim();
      if (!text) return;
      var t = '';
      try { if (p.ts) t = new Date(p.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (_) {}
      captions.push({
        time: t || '', name: nameFor(p.sender_sid, p.senderName),
        role: p.senderRole || '', text: text, mine: false, sid: p.sender_sid || null,
      });
    });
    if (captions.length) {
      addSystemNote(AR ? '— الرسائل السابقة أعلاه —' : '— earlier messages above —');
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
    // Also (re-)relay the buffer: compose FAILURE restores the words and
    // re-renders — without this emit the other side stayed stuck on
    // "composing…" for 25s even though the compose had already failed.
    emitGloss();
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
          });
          elp.appendChild(chip);
        });
      }
    }
    var cbtn = $('meeting-compose-btn');
    if (cbtn) cbtn.disabled = glossBuf().length === 0;
  }

  function onLocalSign(word) {
    var buf = glossBuf();
    buf.push(word);
    // A signer who never composes could grow this without bound — the chips
    // UI and the relay only ever need a recent window.
    while (buf.length > 24) buf.shift();
    renderLocalGloss();
  }

  function clearLocalGloss() {
    window.__meetGlossBuf = [];
    renderLocalGloss(); // emits the now-empty buffer too
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
    var composing = !!(data && data.composing);
    var host = remoteGlossHost();
    if (!host) return;
    if (!words.length && !composing) { hideRemoteGloss(sid); return; }
    host.classList.add('on');
    host.classList.toggle('composing', composing);
    host.textContent = '';
    host.appendChild(el('span', null, '✋'));
    var who = el('b', null, nameFor(sid, data && data.name) + ' ' +
      (composing ? S.composing : S.isSigning));
    host.appendChild(who);
    words.slice(-8).forEach(function (w) { host.appendChild(el('span', 'ml-rg-word', w)); });
    if (composing) host.appendChild(el('span', 'ml-rg-spin'));
    if (rgTimers[sid]) clearTimeout(rgTimers[sid]);
    // While composing, hold the line until the sentence caption arrives — the
    // caption's addCaption() calls hideRemoteGloss(senderSid). The timeout is
    // only a safety net for a lost sentence, so keep it long (a vanished feed
    // with no caption was the reported "disappearing feed" symptom).
    rgTimers[sid] = setTimeout(function () { hideRemoteGloss(sid); }, composing ? 90000 : 10000);
  }

  // The signer pressed Compose: tell the room the words are being turned
  // into a sentence — previously they just VANISHED from the other side's
  // panel until the sentence arrived.
  function notifyComposing(words) {
    var sock = opts.getSocket();
    if (!sock || !sock.connected || !opts.isInMeeting()) return;
    sock.emit('meeting_gloss', {
      room: opts.getRoom(),
      words: (words || []).slice(-12),
      composing: true,
      name: opts.getDisplayName(),
      role: opts.getRole(),
    });
  }
  function hideRemoteGloss(sid) {
    var host = $('ml-remote-gloss');
    if (host) { host.classList.remove('on', 'composing'); host.textContent = ''; }
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
    if (deadTimers[sid]) { clearTimeout(deadTimers[sid]); delete deadTimers[sid]; }
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

  var deadTimers = {};
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
      // WATCHDOG: if the interruption never recovers AND no peer_left ever
      // arrives (flaky signaling), stop showing a frozen ghost — after 12s
      // treat the peer as gone and let the page tear the tile down.
      if (!deadTimers[sid]) {
        deadTimers[sid] = setTimeout(function () {
          delete deadTimers[sid];
          var t2 = document.getElementById('remote-tile-' + String(sid || '').replace(/[^A-Za-z0-9_-]/g, '_'));
          if (t2 && t2.querySelector('.ml-tile-note')) {
            toast(S.peerDead);
            if (opts.removePeer) { try { opts.removePeer(sid); } catch (_) {} }
          }
        }, 12000);
      }
    } else {
      if (note) note.remove();
      if (deadTimers[sid]) { clearTimeout(deadTimers[sid]); delete deadTimers[sid]; }
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
    applyCamOff(sid); // re-apply a known camera-off state to a freshly built tile
    if (pc && !pc.__mlWatched) {
      pc.__mlWatched = true;
      pc.addEventListener('connectionstatechange', function () {
        if (pc.connectionState === 'disconnected') tileNote(sid, true, S.reconnecting);
        else if (pc.connectionState === 'connected') tileNote(sid, false);
      });
    }
  }

  // ── media state (camera on/off) — peers overlay "Camera off" instead of
  //    freezing on the last decoded frame of a stopped WebRTC track ────────
  var camOffSids = {};
  function tileFor(sid) {
    return document.getElementById('remote-tile-' + String(sid || '').replace(/[^A-Za-z0-9_-]/g, '_'));
  }
  function setCamOff(sid, off) {
    if (off) camOffSids[sid] = true; else delete camOffSids[sid];
    applyCamOff(sid);
  }
  function applyCamOff(sid) {
    var tile = tileFor(sid);
    if (!tile) return;
    var overlay = tile.querySelector('.ml-cam-off');
    if (camOffSids[sid]) {
      if (!overlay) {
        overlay = el('div', 'ml-cam-off');
        overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 16v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m22 8-6 4 6 4V8z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';
        overlay.appendChild(el('div', null, (peerNames[sid] && peerNames[sid].name ? peerNames[sid].name + ' — ' : '') + S.cameraOff));
        tile.appendChild(overlay);
      }
    } else if (overlay) {
      overlay.remove();
    }
  }
  function onMediaState(data) {
    var sid = data && data.sender_sid;
    if (!sid) return;
    if (typeof data.camera === 'boolean') setCamOff(sid, !data.camera);
  }
  function emitMedia() {
    var sock = opts.getSocket();
    if (sock && sock.connected && opts.isInMeeting()) {
      sock.emit('meeting_media', { room: opts.getRoom(), mic: micArmed });
    }
  }
  // Called by the page's camera toggle so peers hide/show the "Camera off"
  // overlay (WebRTC track stop alone leaves them on a frozen last frame).
  function emitCameraState(on) {
    var sock = opts.getSocket();
    if (sock && sock.connected && opts.isInMeeting()) {
      sock.emit('meeting_media', { room: opts.getRoom(), camera: !!on, mic: micArmed });
    }
  }

  // ── raise-hand / attention buzz ───────────────────────────────
  function raiseHand() {
    var sock = opts.getSocket();
    if (!sock || !sock.connected || !opts.isInMeeting()) return;
    sock.emit('meeting_raise_hand', { room: opts.getRoom(), name: opts.getDisplayName() });
    toast(AR ? 'تم إرسال طلب الانتباه' : 'Attention sent');
  }
  function attentionFlash() {
    var box = document.querySelector('.d-meet-videos');
    if (!box) return;
    box.classList.remove('ml-attn');
    // reflow to restart the animation
    void box.offsetWidth;
    box.classList.add('ml-attn');
    setTimeout(function () { box.classList.remove('ml-attn'); }, 1800);
  }
  function handBanner(name) {
    var stageBox = document.querySelector('.d-meet-videos');
    var host = stageBox ? stageBox.parentElement : null;
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var b = el('div', 'ml-hand-banner');
    b.appendChild(el('span', null, '✋ ' + (name || S.peer) + ' ' + S.handRaised));
    host.appendChild(b);
    setTimeout(function () { b.remove(); }, 3200);
  }
  function playBeep() {
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
      o.start(); o.stop(ac.currentTime + 0.5);
      setTimeout(function () { try { ac.close(); } catch (_) {} }, 800);
    } catch (_) {}
  }
  function onRaiseHand(data) {
    var name = (data && data.name) || nameFor(data && data.sender_sid);
    handBanner(name);
    attentionFlash();
    playBeep();
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
  var metricEl = null, metricTimer = null, meetingStartMs = 0;
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
    // Stage-chip extras: live elapsed timer + participant count.
    if (!metricEl) {
      metricEl = el('span', 'ml-stage-metric');
      metricEl.id = 'ml-stage-metric';
      chipEl.insertAdjacentElement('afterend', metricEl);
    }
    if (!meetingStartMs) meetingStartMs = mlNow();
    if (!metricTimer) metricTimer = setInterval(updateMetric, 1000);
    updateMetric();
    // The model is chosen ONCE in the create/join dialog and stays fixed for
    // the whole meeting (a mid-meeting picker invited exactly the "unusual
    // bugs" the owner asked to prevent) — the chip only REPORTS it.
    var camSel = opts.getCamLangSelect();
    if (camSel && !camSel.__mlChipBound) {
      camSel.__mlChipBound = true;
      camSel.addEventListener('change', updateChip);
    }
    updateChip();
  }
  function mlNow() { try { return performance.now(); } catch (_) { return 0; } }
  function updateMetric() {
    if (!metricEl) return;
    var secs = Math.max(0, Math.floor((mlNow() - meetingStartMs) / 1000));
    var mm = String(Math.floor(secs / 60)).padStart(2, '0');
    var ss = String(secs % 60).padStart(2, '0');
    var n = 1 + Object.keys((opts.getPeers && opts.getPeers()) || {}).length; // include self
    var ppl = AR ? (n + ' مشارك') : (n + (n === 1 ? ' participant' : ' participants'));
    metricEl.textContent = '⏱ ' + mm + ':' + ss + ' · 👥 ' + ppl;
  }
  window.MeetLive_updateMetric = updateMetric; // page calls after peer add/remove
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

  // Mic mode: 'ptt' (hold Space / hold the button to talk) or 'live'
  // (continuous). Persisted; the picker + mode toggle are ALWAYS visible
  // whenever the mic controls exist (the old code hid the picker unless ≥2
  // devices AND hid it while the mic was off).
  var micModeEl = null, pttHintEl = null;
  function micMode() {
    try { return localStorage.getItem('meeting-mic-mode') === 'live' ? 'live' : 'ptt'; }
    catch (_) { return 'ptt'; }
  }
  function setMicMode(m) {
    try { localStorage.setItem('meeting-mic-mode', m); } catch (_) {}
    syncMicModeUi();
  }
  function syncMicModeUi() {
    if (micModeEl) {
      var live = micMode() === 'live';
      micModeEl.textContent = live ? ('🎧 ' + S.liveMic) : ('🎙️ ' + S.ptt);
      micModeEl.setAttribute('aria-pressed', live ? 'true' : 'false');
    }
    if (pttHintEl) pttHintEl.style.display = (micArmed && micMode() === 'ptt') ? 'inline-flex' : 'none';
  }

  function populateMicList() {
    if (!micSelEl || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then(function (devs) {
      var mics = devs.filter(function (d) { return d.kind === 'audioinput'; });
      var want = chosenMicId();
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
      micSelEl.value = want;
      if (micSelEl.value !== want) micSelEl.value = '';
      micSelEl.classList.add('on'); // ALWAYS visible
    }).catch(function () {});
  }

  function ensureMicUi() {
    var btn = micBtn();
    if (!btn || $('ml-mic-meter')) { syncMicModeUi(); return; }
    micMeterEl = document.createElement('canvas');
    micMeterEl.id = 'ml-mic-meter';
    micMeterEl.className = 'ml-mic-meter';
    micMeterEl.width = 128; micMeterEl.height = 52;
    btn.insertAdjacentElement('afterend', micMeterEl);

    // Mode toggle (PTT / Live) — always visible next to the mic button.
    micModeEl = document.createElement('button');
    micModeEl.type = 'button';
    micModeEl.id = 'ml-mic-mode';
    micModeEl.className = 't-btn t-btn--ghost ml-mic-mode';
    micModeEl.addEventListener('click', function () {
      setMicMode(micMode() === 'live' ? 'ptt' : 'live');
      if (micArmed) { disarmMic(); armMic(); } // re-arm under the new mode
    });
    micMeterEl.insertAdjacentElement('afterend', micModeEl);

    micSelEl = document.createElement('select');
    micSelEl.id = 'ml-mic-sel';
    micSelEl.className = 'd-lang-sel ml-mic-sel';
    micSelEl.setAttribute('aria-label', S.micDevice);
    micSelEl.addEventListener('change', function () {
      try { localStorage.setItem('meeting-mic-device', micSelEl.value); } catch (_) {}
      if (micArmed && micMode() === 'live') { disarmMic(); armMic(); } // hot-swap
    });
    micModeEl.insertAdjacentElement('afterend', micSelEl);

    pttHintEl = el('span', 'ml-ptt-hint', S.holdSpace);
    pttHintEl.id = 'ml-ptt-hint';
    micSelEl.insertAdjacentElement('afterend', pttHintEl);

    populateMicList();
    installPttKey();
    syncMicModeUi();
  }

  function startMeter(stream) {
    // NOTE: stopMeter() stops meterStream — assign the NEW stream only after
    // the old one is torn down. Assigning it before this call made stopMeter
    // kill the stream we were about to record from, and MediaRecorder.start()
    // then threw NotSupportedError on the dead stream.
    stopMeter(false);
    meterStream = stream;
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

  function refreshMicButton() {
    var btn = micBtn();
    if (!btn) return;
    btn.classList.remove('on');
    btn.style.background = ''; btn.style.color = '';
    if (pttHolding) {
      btn.textContent = S.micRecording;
      btn.style.background = 'rgba(220,50,50,.22)'; btn.style.color = '#ff6b6b';
      btn.classList.add('on');
    } else if (micArmed && micMode() === 'live') {
      btn.textContent = S.micOn; btn.classList.add('on');
    } else if (micArmed) {
      btn.textContent = '🎙️ ' + S.ptt; btn.classList.add('on'); // armed, waiting for hold
    } else {
      btn.textContent = S.micOff;
    }
  }
  function setMicButton() { refreshMicButton(); } // legacy shim

  function micConstraints() {
    var id = micSelEl ? micSelEl.value : chosenMicId();
    return id ? { audio: { deviceId: { exact: id } } } : { audio: true };
  }

  // Push-to-talk MediaRecorder → /api/stt. Used for Arabic always, and for
  // English when a specific (non-default) input device is selected —
  // SpeechRecognition can only listen on the OS default device.
  function pickAudioMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    var candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < candidates.length; i++) {
      try { if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i]; } catch (_) {}
    }
    return '';
  }

  async function startRecorder(language) {
    var stream;
    try { stream = await navigator.mediaDevices.getUserMedia(micConstraints()); }
    catch (e) { opts.setStatus(S.micDenied, false); return false; }
    startMeter(stream); // takes ownership of the stream (meterStream)
    micChunks = [];
    var mime = pickAudioMime();
    try {
      micMediaRec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (e) {
      micMediaRec = new MediaRecorder(stream);
    }
    var recMime = (micMediaRec.mimeType || mime || 'audio/webm').split(';')[0];
    micMediaRec.ondataavailable = function (e) { if (e.data.size > 0) micChunks.push(e.data); };
    micMediaRec.onstop = async function () {
      stopMeter(); // stops + releases the stream (it owns meterStream)
      var blob = new Blob(micChunks, { type: recMime });
      micChunks = [];
      micMediaRec = null;
      if (!blob.size) { setMicButton('off'); return; }
      opts.setStatus(S.micTranscribing, true);
      try {
        var fd = new FormData();
        var ext = recMime.indexOf('mp4') >= 0 ? 'mp4' : (recMime.indexOf('ogg') >= 0 ? 'ogg' : 'webm');
        fd.append('file', blob, 'meeting_speech.' + ext);
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
    refreshMicButton();
    return true;
  }

  // ── PTT vs Live mic control ───────────────────────────────────
  var micArmed = false, pttHolding = false, pttKeyInstalled = false;

  function installPttKey() {
    if (pttKeyInstalled) return;
    pttKeyInstalled = true;
    var typing = function (t) {
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    };
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (!micArmed || micMode() !== 'ptt') return;
      if (typing(e.target)) return;
      e.preventDefault();
      pttStart();
    });
    document.addEventListener('keyup', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (micMode() !== 'ptt') return;
      pttEnd();
    });
  }

  async function armMic() {
    if (micArmed) return;
    micArmed = true;
    emitMedia(); // mic state to peers (best-effort)
    if (micMode() === 'live') {
      await startLive();
    } else {
      // PTT armed: open a monitor stream so the level meter shows the user
      // their mic is live; recording only happens while holding.
      try {
        var monitor = await navigator.mediaDevices.getUserMedia(micConstraints());
        startMeter(monitor);
      } catch (e) { opts.setStatus(S.micDenied, false); micArmed = false; }
      populateMicList(); // device labels are available now that we have permission
    }
    refreshMicButton();
    syncMicModeUi();
  }

  function disarmMic() {
    micArmed = false;
    pttHolding = false;
    if (micRec) { try { micRec.onend = null; micRec.stop(); } catch (_) {} micRec = null; }
    if (micMediaRec && micMediaRec.state !== 'inactive') {
      try { micMediaRec.stop(); } catch (_) {} // onstop transcribes + refreshes
    } else {
      micMediaRec = null;
      stopMeter();
    }
    emitMedia();
    refreshMicButton();
    syncMicModeUi();
  }

  async function startLive() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // No continuous recognition here — fall back to push-to-talk.
      setMicMode('ptt');
      opts.setStatus(AR ? 'الاستماع المباشر غير مدعوم — استخدم اضغط للتحدث' : 'Live listening unsupported — using push-to-talk', false);
      try { var m = await navigator.mediaDevices.getUserMedia(micConstraints()); startMeter(m); } catch (_) {}
      return;
    }
    try { var monitor = await navigator.mediaDevices.getUserMedia(micConstraints()); startMeter(monitor); } catch (_) {}
    micRec = new SR();
    micRec.continuous = true;
    micRec.interimResults = false;
    micRec.lang = AR ? 'ar-EG' : (navigator.language || 'en-US');
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
      if (FATAL[e.error]) { disarmMic(); opts.setStatus(S.micDenied + ' (' + e.error + ')', false); }
    };
    micRec.onend = function () {
      if (micArmed && micRec) {
        try { micRec.start(); } catch (err) {
          if (String(err && err.name) !== 'InvalidStateError') disarmMic();
        }
      }
    };
    try { micRec.start(); }
    catch (_) { disarmMic(); opts.setStatus(AR ? 'الميكروفون مشغول' : 'Mic busy — press again', false); }
  }

  async function pttStart() {
    if (!micArmed || micMode() !== 'ptt' || pttHolding) return;
    if (micMediaRec && micMediaRec.state !== 'inactive') return; // already recording
    pttHolding = true;
    refreshMicButton();
    var ok = await startRecorder(AR ? 'arabic' : 'english');
    if (!ok) { pttHolding = false; refreshMicButton(); }
  }
  function pttEnd() {
    if (!pttHolding) return;
    pttHolding = false;
    if (micMediaRec && micMediaRec.state !== 'inactive') {
      try { micMediaRec.stop(); } catch (_) {} // onstop transcribes + refreshes button
    }
    refreshMicButton();
  }

  // The mic button ARMS/DISARMS. In PTT mode a pointer-hold on the button
  // also works as push-to-talk (in addition to the Space key).
  var micBtnBound = false;
  function bindMicButton() {
    var btn = micBtn();
    if (!btn || micBtnBound) return;
    micBtnBound = true;
    btn.addEventListener('pointerdown', function (e) {
      if (micArmed && micMode() === 'ptt') { e.preventDefault(); pttStart(); }
    });
    var endHold = function () { if (micMode() === 'ptt') pttEnd(); };
    btn.addEventListener('pointerup', endHold);
    btn.addEventListener('pointerleave', endHold);
    btn.addEventListener('pointercancel', endHold);
  }

  async function toggleMic() {
    if (!opts.isInMeeting()) { opts.setStatus(AR ? 'انضم إلى اجتماع أولاً' : 'Join meeting first', false); return; }
    ensureMicUi();
    bindMicButton();
    if (micArmed) disarmMic();
    else await armMic();
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

  function normalizeWords(text, isAr) {
    if (isAr) {
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

  // Per-word landmark cache — repeated words play instantly instead of
  // re-downloading their landmark clips on every sentence.
  var signCache = {};
  var signCacheKeys = [];
  var SIGN_CACHE_MAX = 80;
  function cachePut(lang, word, item) {
    var k = lang + '|' + String(word || '').toLowerCase();
    if (!(k in signCache)) {
      signCacheKeys.push(k);
      if (signCacheKeys.length > SIGN_CACHE_MAX) delete signCache[signCacheKeys.shift()];
    }
    signCache[k] = item;
  }
  function cacheGet(lang, word) {
    return signCache[lang + '|' + String(word || '').toLowerCase()] || null;
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (resolve) { setTimeout(function () { resolve(null); }, ms); }),
    ]);
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
      // Immediate feedback — the old flow showed a frozen idle avatar for as
      // long as gloss LLM + landmark download took (reported ~10s).
      if (wordEl) wordEl.textContent = '⏳ ' + S.avatarLoading;

      // Pick the sign language from the TEXT (Arabic letters → ArSL), so a
      // speaker typing Arabic on the English dashboard still signs correctly.
      var isArText = textIsArabic(sentence);
      var langKey = isArText ? 'ar' : 'en';

      var words = null;
      if (opts.sentenceToGloss) {
        // The LLM gloss is a nice-to-have; never let it hold the avatar
        // hostage — 1.2s budget, then fall back to plain word order.
        try { words = await withTimeout(opts.sentenceToGloss(sentence, isArText ? 'arabic' : 'english'), 1200); } catch (_) {}
      }
      if (!words || !words.length) words = normalizeWords(sentence, isArText);
      if (!words.length) continue;

      // The server REWRITES words while resolving them — Arabic words come
      // back as their English class keys (طفل → baby), English gets
      // normalized/expanded (I'm → i am), duplicates get merged, and a whole
      // phrase can match as ONE item. Reconciling the response against the
      // REQUESTED words therefore missed signs the server actually found and
      // reported them as "no sign clip" (verified live — ArSL captions never
      // played at all). Play exactly what the server returns, in its order;
      // the word cache only serves sentences whose every word hits it.
      var playlist = [];
      var notFound = [];
      var allCached = words.every(function (w) { return !!cacheGet(langKey, w); });
      if (allCached) {
        playlist = words.map(function (w) { return cacheGet(langKey, w); });
      } else {
        var data = null;
        try {
          var res = await opts.authFetch(BATCH_URLS[langKey], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words: words }),
          });
          if (res.ok) data = await res.json();
        } catch (_) {}
        if (data && Array.isArray(data.found)) {
          playlist = data.found.filter(function (item) { return item && item.landmarks; });
          playlist.forEach(function (item) {
            if (item.word) cachePut(langKey, item.word, item);
          });
          notFound = Array.isArray(data.missing) ? data.missing.slice() : [];
        } else {
          notFound = words.slice(); // request failed — nothing resolvable
        }
      }
      if (notFound.length) {
        // Surface it where the user is looking instead of failing silently.
        var sep = isArText ? '، ' : ', ';
        addSystemNote('⚠ ' + S.avatarMissing + ' ' + notFound.join(sep));
        toast(S.avatarMissing + ' ' + notFound.slice(0, 3).join(sep));
      }
      if (!playlist.length) continue;

      for (var wi = 0; wi < playlist.length; wi++) {
        var item2 = playlist[wi];
        var lms = item2.landmarks || [];
        var n = item2.frame_count || lms.length;
        if (wordEl) wordEl.textContent = item2.word_ar || item2.word || '';
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

  // ── caption tools: font-size, transcript export, raise-hand ───
  var FONT_STEPS = [0.85, 1, 1.2, 1.45];
  function fontScaleIndex() {
    try {
      var i = parseInt(localStorage.getItem('meeting-cap-size'), 10);
      return (i >= 0 && i < FONT_STEPS.length) ? i : 1;
    } catch (_) { return 1; }
  }
  function applyFontScale() {
    var box = $('meeting-caption-history');
    var scale = FONT_STEPS[fontScaleIndex()];
    if (box) box.style.setProperty('--ml-cap-scale', scale);
    var ov = $('meeting-subtitle-overlay');
    if (ov) ov.style.setProperty('--ml-cap-scale', scale);
    if (fontGroupEl) {
      Array.prototype.forEach.call(fontGroupEl.children, function (b, i) {
        b.classList.toggle('on', i === fontScaleIndex());
      });
    }
  }
  function setFontScale(i) {
    try { localStorage.setItem('meeting-cap-size', String(i)); } catch (_) {}
    applyFontScale();
  }

  var toolsEl = null, fontGroupEl = null;
  function ensureCaptionTools() {
    if (toolsEl && toolsEl.isConnected) { applyFontScale(); return; }
    var label = $('meeting-caption-label');
    if (!label || !label.parentElement) return;
    toolsEl = el('div', 'ml-tools');
    toolsEl.id = 'ml-caption-tools';

    // raise-hand / attention
    var hand = el('button', 'ml-tool-btn', S.raiseHand);
    hand.type = 'button';
    hand.title = S.raiseHand;
    hand.addEventListener('click', raiseHand);
    toolsEl.appendChild(hand);

    // transcript export
    var exp = el('button', 'ml-tool-btn', '⬇ ' + S.exportTxt);
    exp.type = 'button';
    exp.addEventListener('click', exportTranscript);
    toolsEl.appendChild(exp);

    // font-size A / A+ / A++
    fontGroupEl = el('div', 'ml-font-group');
    fontGroupEl.setAttribute('aria-label', S.fontSize);
    ['A', 'A', 'A', 'A'].forEach(function (_t, i) {
      var b = el('button', null, 'A');
      b.type = 'button';
      b.style.fontSize = (11 + i * 3) + 'px';
      b.title = S.fontSize;
      b.addEventListener('click', function () { setFontScale(i); });
      fontGroupEl.appendChild(b);
    });
    toolsEl.appendChild(fontGroupEl);

    label.parentElement.insertBefore(toolsEl, label.nextSibling);
    applyFontScale();
  }

  function exportTranscript() {
    var lines = captions.filter(function (c) { return !c.system; }).map(function (c) {
      var who = c.mine ? S.you : (c.name || S.peer);
      var rl = roleLabel(c.role);
      return '[' + (c.time || '') + '] ' + who + (rl ? ' (' + rl + ')' : '') + ': ' + c.text;
    });
    if (!lines.length) { toast(S.noMessages); return; }
    var header = (AR ? 'نص اجتماع Together — الغرفة ' : 'Together meeting transcript — room ') + (opts.getRoom() || '') + '\n' +
      '='.repeat(40) + '\n\n';
    var blob = new Blob([header + lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    try {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'together-meeting-' + (opts.getRoom() || 'room') + '.txt';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (_) {}
  }

  // ── signer self-preview skeleton (drawn on the local meeting tile) ──
  var selfSkelCanvas = null, selfSkelTag = null;
  function ensureSelfSkel() {
    if (selfSkelCanvas && selfSkelCanvas.isConnected) return selfSkelCanvas;
    var video = $('meeting-local-video');
    var wrap = video ? video.closest('.d-meet-vid-wrap') : null;
    if (!wrap) return null;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    selfSkelCanvas = document.createElement('canvas');
    selfSkelCanvas.id = 'ml-self-skel';
    wrap.appendChild(selfSkelCanvas);
    selfSkelTag = el('div', 'ml-self-tag', S.selfSkeleton);
    wrap.appendChild(selfSkelTag);
    return selfSkelCanvas;
  }
  // Called by the page's onHolisticResults while a signer is in a meeting —
  // gives the signer visual confirmation their hands are being tracked.
  function drawSelfSkeleton(results) {
    if (!opts.isSigner() || !opts.isInMeeting() || !results) return;
    var cv = ensureSelfSkel();
    if (!cv) return;
    var w = (results.image && results.image.width) || 640;
    var h = (results.image && results.image.height) || 480;
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (window.drawConnectors && window.HAND_CONNECTIONS) {
      if (results.leftHandLandmarks) window.drawConnectors(ctx, results.leftHandLandmarks, window.HAND_CONNECTIONS, { color: '#00ffff', lineWidth: 2 });
      if (results.rightHandLandmarks) window.drawConnectors(ctx, results.rightHandLandmarks, window.HAND_CONNECTIONS, { color: '#ff00ff', lineWidth: 2 });
    }
    if (window.drawLandmarks) {
      if (results.leftHandLandmarks) window.drawLandmarks(ctx, results.leftHandLandmarks, { color: '#fff', lineWidth: 0.5, radius: 2 });
      if (results.rightHandLandmarks) window.drawLandmarks(ctx, results.rightHandLandmarks, { color: '#fff', lineWidth: 0.5, radius: 2 });
    }
  }
  function clearSelfSkel() {
    if (selfSkelCanvas) { try { selfSkelCanvas.remove(); } catch (_) {} selfSkelCanvas = null; }
    if (selfSkelTag) { try { selfSkelTag.remove(); } catch (_) {} selfSkelTag = null; }
  }

  // ── lifecycle ─────────────────────────────────────────────────
  function onJoined() {
    // The animated aurora background (three blur(100px) blobs) competes with
    // camera capture + WebRTC encode for the GPU — pause it during calls.
    document.body.classList.add('ml-in-meeting');
    ensureIndicators();
    ensureMicUi();
    ensureCaptionTools();
    bindMicButton();
    // The signer's role UI hides the mic button — hide its companions too.
    var micHidden = opts.isSigner();
    [micSelEl, micMeterEl, micModeEl, pttHintEl].forEach(function (e2) {
      if (e2) e2.style.display = micHidden ? 'none' : '';
    });
    if (!micHidden) syncMicModeUi(); // restores pttHint display rule
    renderLocalGloss();
    renderCaptions();
    applyFontScale();
  }

  function onLeave() {
    document.body.classList.remove('ml-in-meeting');
    disarmMic();
    resetAvatar();
    hideRemoteGloss();
    Object.keys(rgTimers).forEach(function (k) { clearTimeout(rgTimers[k]); });
    rgTimers = {};
    Object.keys(deadTimers).forEach(function (k) { clearTimeout(deadTimers[k]); });
    deadTimers = {};
    camOffSids = {};
    editingActive = false;
    captions = [];
    clearLocalGloss();
    renderCaptions();
    peerNames = {};
    if (metricTimer) { clearInterval(metricTimer); metricTimer = null; }
    meetingStartMs = 0;
    clearSelfSkel();
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
    addSystemNote: addSystemNote,
    onCaptionHistory: onCaptionHistory,
    notifyComposing: notifyComposing,
    onLocalSign: onLocalSign,
    clearLocalGloss: clearLocalGloss,
    renderLocalGloss: renderLocalGloss,
    onRemoteGloss: onRemoteGloss,
    onPeerNamed: onPeerNamed,
    onPeerLeft: onPeerLeft,
    watchTile: watchTile,
    toggleMic: toggleMic,
    stopMic: disarmMic,
    toggleSpeechOut: toggleSpeechOut,
    enqueueAvatar: enqueueAvatar,
    noteSignEvent: noteSignEvent,
    onJoined: onJoined,
    onLeave: onLeave,
    updateChip: updateChip,
    // round-4 additions
    onMediaState: onMediaState,
    emitCameraState: emitCameraState,
    onRaiseHand: onRaiseHand,
    raiseHand: raiseHand,
    drawSelfSkeleton: drawSelfSkeleton,
    updateMetric: updateMetric,
  };
})();
