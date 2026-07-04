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
    // While composing, hold the line until the sentence caption arrives (or a
    // generous timeout — the LLM can take several seconds).
    rgTimers[sid] = setTimeout(function () { hideRemoteGloss(sid); }, composing ? 25000 : 8000);
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
      var monitor = await navigator.mediaDevices.getUserMedia(micConstraints());
      startMeter(monitor); // takes ownership
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

      // Serve every word we can from the cache; fetch only the misses.
      var playlist = [];
      var misses = [];
      words.forEach(function (w) {
        if (!cacheGet(langKey, w)) misses.push(w);
      });
      var data = null;
      if (misses.length) {
        try {
          var res = await opts.authFetch(BATCH_URLS[langKey], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words: misses }),
          });
          if (res.ok) data = await res.json();
        } catch (_) {}
        if (data && Array.isArray(data.found)) {
          data.found.forEach(function (item) {
            if (item && item.word) cachePut(langKey, item.word, item);
          });
        }
      }
      var notFound = [];
      words.forEach(function (w) {
        var item = cacheGet(langKey, w);
        if (item) playlist.push(item);
        else notFound.push(w);
      });
      if (notFound.length) {
        // Surface it where the user is looking instead of failing silently.
        addSystemNote('⚠ ' + S.avatarMissing + ' ' + notFound.join('، '));
        toast(S.avatarMissing + ' ' + notFound.slice(0, 3).join('، '));
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

  // ── lifecycle ─────────────────────────────────────────────────
  function onJoined() {
    // The animated aurora background (three blur(100px) blobs) competes with
    // camera capture + WebRTC encode for the GPU — pause it during calls.
    document.body.classList.add('ml-in-meeting');
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
    document.body.classList.remove('ml-in-meeting');
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
    addSystemNote: addSystemNote,
    notifyComposing: notifyComposing,
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
