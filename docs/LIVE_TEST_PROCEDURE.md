# Live Test Procedures (hardening pass — needs a human + camera)

Everything here verifies work that CANNOT be tested headlessly (browser
MediaPipe, webcam, WebRTC). Offline, both models are already verified through
the production code path (`python scripts/model_harness.py --min-en 0.66
--min-ar 0.95`): ASL 66.5% top-1, ArSL 95%.

## 0. One-time deploy setup (Render dashboard → Environment)

| Variable | Value | Why |
| --- | --- | --- |
| `CLOUDFLARE_TURN_KEY_ID` | your TURN key id | enables the TURN relay for cross-network meetings |
| `CLOUDFLARE_TURN_API_TOKEN` | your TURN API token | (server-side only; never sent to browsers) |
| `SIGN_DEBUG` | `1` *(optional, during testing)* | server logs a summary of every payload reaching the models |
| `ALLOWED_ORIGINS` | *(now optional)* | the app auto-allows its own `RENDER_EXTERNAL_URL`; still set it if you serve from a custom domain |

Deploy the branch, then confirm boot logs contain `[warm] Arabic engine ready`
(the warm-up used to be a silent no-op).

## 1. Live signing session — repeat per (page × language)

Do this four times: dashboard EN, dashboard AR, practice EN, practice AR.

1. Open the page with `?diag=1` appended, e.g. `/dashboard?lang=en&diag=1`
   (practice: `/practice?lang=ar&diag=1`). A small **SignDiag HUD** appears
   bottom-left.
2. Start the camera. Sign **5 known signs** (EN: pick from the dictionary,
   e.g. *book, drink, mom*; AR: pick from the 20, e.g. *baby, eat, thanks*),
   each 2–3 times, pausing ~2s between signs.
3. While signing, read the HUD:
   - **fps** — delivered MediaPipe rate (expect ≥ 10; phones lower).
   - **L% / R% / any%** — share of frames with each hand detected while your
     hands were up (expect any% ≥ 70 during signing).
   - **sent** — payloads actually sent to the server.
   - **last** — last accepted sign + confidence.
4. Click **“download diag dump”** in the HUD (saves `sign-diag-*.json`).
5. Record: page, language, fps, L/R/any %, how many of the 5 signs were
   detected correctly / wrongly / not at all.

**Send me:** the four dumps + the four number rows. I replay each dump through
the production predictors offline:

```
python scripts/replay_live_dump.py sign-diag-<...>.json --expect book
```

How to read the outcome:
- **Replay detects your signs** → live payload format matches training; any
  remaining live weakness is detection rate/latency (tune capture), not
  encoding. Expected result after the selfie-mode fix.
- **Replay misses like the live page missed** → the captured frames still
  diverge from training format; the dump tells me exactly how (mirroring,
  zeros-vs-null, w/h) without another session.
- The replay also warns if missing hands arrive as `0.0` instead of `null`
  (that would silently mask detection failures on the ASL path).

If `SIGN_DEBUG=1` is set, the Render logs show matching
`[SignDebug:...] lang=... frames=... NaN=...% lh_present=...` lines — a quick
server-side cross-check of the same numbers.

## 2. Live meeting — two devices

Use a laptop + a phone **on different networks** (phone on mobile data — this
is the case that requires TURN). Both logged in, both with the browser console
open (phone: use `chrome://inspect` or repeat with two laptops if needed).

1. Device A: Dashboard → Live Meeting → Join (note the 5-letter room code).
2. Device A console: expect `[WebRTC] ICE config loaded (turn=true)`.
   If `turn=false` → the Cloudflare env vars are missing/wrong on Render, or
   the mint call failed (check Render logs for `[webrtc-config]`).
3. Device B: join the same code.
4. Watch both consoles for per-peer lines:
   - `[WebRTC] <sid> ice: checking → connected` and
     `connection: connecting → connected` → **success**; both tiles show video.
5. Exercise the features: signer signs (captions should appear on the other
   device), speaker uses the mic (signer side shows caption + avatar).
6. Kill and restore the network on one device for ~10s: the tab should
   rejoin the room and re-establish video within ~15s (this used to hang
   forever in a stale meeting UI).

**Report per failure mode (if any):**
| Symptom | What to send |
| --- | --- |
| never connects | both consoles' last `[WebRTC] ... ice:` line (e.g. stuck at `checking`), and whether step 2 said `turn=true` |
| connects then drops | the `connection:`/`ice:` transition lines around the drop |
| video but no captions | which direction is silent + any console errors |
| rejoin after network blip fails | console lines after reconnect |

## 3. What “fixed” looks like

- Dashboard sign→text detects most of your 5 signs in both languages on both
  the socket path (normal) and the HTTP path (to force it: block WebSocket in
  DevTools → Network conditions, or add `?diag=1` and watch `path:'http'`
  payloads appear if the socket drops).
- Practice mode grades the same signs correctly in both languages.
- Meeting connects laptop↔phone-on-LTE with video both ways, captions per
  role, and survives a 10s network blip.
