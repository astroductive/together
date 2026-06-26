/* Together — shared sign-landmark player
 *
 * Reused by the Sign Dictionary and Practice pages to replay a sign's landmark
 * sequence onto a canvas using the same avatar renderer as the dashboard
 * (drawAuraAvatar, defined in app.js). Include app.js + auth.js before this.
 */
(function (global) {
  'use strict';

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  // If landmarks[f] is a flat array, pass through; if nested [[x,y,z],...] flatten.
  function flattenLandmarkFrame(frame) {
    if (!frame) return null;
    if (typeof frame[0] === 'number') return frame;
    return frame.flat();
  }

  // Fetch a single sign's landmark frames. Returns
  //   { word, landmarks: [N][...], frame_count, video_url } or null if missing.
  async function fetchSignLandmarks(word) {
    try {
      const res = await authFetch('/api/signs/' + encodeURIComponent(word));
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  // Play one or more sign items onto a canvas. Each item: {word, landmarks, frame_count}.
  // opts: { fps=40, holdMs=350, label=true, loop=false, signal:{stop:bool} }
  async function playLandmarkSequence(items, canvas, ctx, opts) {
    opts = opts || {};
    const fps = opts.fps || 40;
    const frameDelay = Math.max(8, Math.round(1000 / fps));
    const holdMs = opts.holdMs != null ? opts.holdMs : 350;
    const showLabel = opts.label !== false;
    const signal = opts.signal || {};
    let lastFlat = null, lastWord = '';

    do {
      for (const item of items) {
        if (signal.stop) break;
        const lms = item.landmarks || [];
        const n = item.frame_count || lms.length;
        lastWord = item.word || '';
        for (let f = 0; f < n; f++) {
          if (signal.stop) break;
          const flat = flattenLandmarkFrame(lms[f]);
          lastFlat = flat;
          global.drawAuraAvatar(ctx, flat, canvas.width, canvas.height);
          if (showLabel) {
            ctx.save();
            ctx.font = 'bold 20px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillText((item.word || '').toUpperCase(), 20, 34);
            ctx.fillStyle = 'rgba(0,255,255,0.5)';
            ctx.fillRect(0, canvas.height - 4, (f / n) * canvas.width, 4);
            ctx.restore();
          }
          await sleep(frameDelay);
        }
        if (!signal.stop) await sleep(holdMs);
      }
    } while (opts.loop && !signal.stop);

    if (lastFlat && !signal.stop) {
      global.drawAuraAvatar(ctx, lastFlat, canvas.width, canvas.height);
      if (showLabel) {
        ctx.save();
        ctx.font = 'bold 20px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(lastWord.toUpperCase(), 20, 34);
        ctx.restore();
      }
    }
  }

  global.SignPlayer = {
    sleep: sleep,
    flattenLandmarkFrame: flattenLandmarkFrame,
    fetchSignLandmarks: fetchSignLandmarks,
    playLandmarkSequence: playLandmarkSequence,
  };
})(window);
