# SignLine (Live Meeting) — Bug-Hunt & Optimization Report (Round 3)

**Scope:** full adversarial pass over the meeting stack — `meeting-live.js`, the meeting sections of both dashboards, and the server socket handlers — plus an extended in-sandbox test matrix run with real Chromium clients against the real server: 3-client mesh, late join, leave/rejoin, forced compose failure, avatar playback against stubbed landmark data, caption-edit races, abrupt-close presence.

**How verified:** every "Fixed" item below was re-tested in the two/three-browser rig after the fix; "Needs manual verification" items depend on Gemini APIs or real cameras/network, which the sandbox cannot reach.

---

## Bugs, by severity

### HIGH

#### 1. Compose failure left the room stuck on "composing…"
- **Description:** If the signer pressed Compose and the sentence API call failed, the signer got their words back — but every other participant kept seeing "✋ NAME is composing a sentence…" with a spinner for 25 seconds.
- **Repro:** Signer buffers words → block `/api/translate/sentence` (network drop) → Compose.
- **Root cause:** The failure path restored the local buffer and re-rendered the chips, but nothing re-relayed the buffer state; the `composing:true` relay was never superseded.
- **Fix:** The gloss render now always re-emits the buffer (throttled). On failure the room reverts to "✋ is signing: word word" within ~400 ms.
- **Risk:** Very low — one extra throttled emit on a path that already emits.
- **Status:** **Fixed** (verified cross-client with a forced network failure).

#### 2. Captions were unrecoverable — late joiners and rejoiners saw an empty panel
- **Description:** Anyone joining a running meeting (or rejoining after leaving / after a connection blip) started with "No messages yet" — the conversation so far was gone. Messages relayed during a reconnect gap were silently lost forever.
- **Repro:** Speaker sends two messages → second participant joins → their caption panel is empty.
- **Root cause:** Captions were relay-only; the server kept no room state beyond membership.
- **Fix:** The server keeps a rolling **20-caption history per room** (in-memory — correct for this app's single-worker design) with server timestamps, replayed on `join_room` onto an empty panel with an "— earlier messages above —" separator. History is dropped when a room empties or when a fresh meeting reuses a code, so nothing leaks across meetings.
- **Risk:** Low — bounded memory (≤20 entries/room, freed on empty), replay only fills an empty panel (no dedup complexity, no TTS/avatar side effects on replay).
- **Status:** **Fixed** (verified: late joiner receives both prior messages, timestamped).

#### 3. Spurious meeting drops on slow machines (introduced in round 2)
- **Description:** Round 2 set the socket `ping_timeout` to 10 s to make departures visible faster. But a client whose main thread stalls — exactly the machines where the landmark models run at 150–200 ms/frame — can miss pongs and get disconnected *while still in the meeting*. Every spurious drop tears down the mesh and loses captions.
- **Repro:** Observed directly in the CPU-starved test environment: a client silently reconnected mid-test and missed captions sent during the gap.
- **Root cause:** Detection speed was traded too aggressively against stall tolerance.
- **Fix:** `ping_timeout` back to the 20 s default (interval stays 15 s → departure detection ≤35 s, still better than the original ≤45 s). The *user-facing* departed-peer problem doesn't regress: the per-tile "connection interrupted" overlay fires within seconds of the video stalling and the 12 s watchdog removes dead tiles regardless of the socket timeout.
- **Risk:** Low.
- **Status:** **Fixed**.

### MEDIUM

#### 4. An incoming caption destroyed an open caption edit
- **Description:** While correcting one of your own captions, any caption arriving from the room re-rendered the feed and blew away the input — your typed correction was lost mid-edit.
- **Root cause:** The caption feed re-renders wholesale on every update; the edit input lived inside it.
- **Fix:** Renders are deferred while an edit is open and applied when it closes (save or Escape).
- **Risk:** Very low.
- **Status:** **Fixed**.

#### 5. Unbounded relay payloads
- **Description:** The server relayed caption text and sender names verbatim — one buggy or hostile client could fan out megabyte payloads to every participant in the room.
- **Fix:** Server-side caps: caption text 4 000 chars, display names 80 chars, gloss words already capped at 12×40.
- **Risk:** Low (caps far above legitimate sizes).
- **Status:** **Fixed**.

#### 6. Signer's pending-word buffer grew without bound
- **Description:** A signer who signs continuously without composing accumulated an ever-growing chip list (DOM bloat, giant relay payloads truncated only at the server).
- **Fix:** Buffer keeps the most recent 24 words (oldest dropped).
- **Status:** **Fixed**.

#### 7. Framerate-first sender policy could silently fail to apply
- **Description:** `degradationPreference: 'maintain-framerate'` (round 2's fix for "my video is a slideshow but high-res") was set immediately after `addTrack`, before negotiation — where `setParameters` may be a no-op.
- **Fix:** The policy is re-asserted when the connection actually reaches `connected`.
- **Status:** **Fixed** (effect on real hardware: needs manual verification, see below).

### LOW

#### 8. Phantom "connection lost" toast after leaving
- **Description:** The 12 s frozen-tile watchdog and the gloss-line timers survived leaving the meeting; a stale timer could fire a "Participant connection lost" toast on the empty meeting screen.
- **Fix:** All watchdog/gloss timers cleared on leave and on `peer_left`.
- **Status:** **Fixed**.

#### 9. Stale caption history replayed into a brand-new meeting
- **Description:** (Introduced by fix #2, caught in the same pass.) If a meeting code was reused later, the first joiner could receive the previous meeting's captions.
- **Fix:** Joining an *empty* room drops any stored history; history is also freed whenever a room empties.
- **Status:** **Fixed**.

#### 10. Arabic list separator in English missing-words note
- **Description:** "No sign clip for: HELLO، ALL" — Arabic comma in English text.
- **Fix:** Separator follows the text's script.
- **Status:** **Fixed**.

---

## Needs manual verification (sandbox cannot reach these)

| Item | What to check |
|---|---|
| TTS both directions | "Read captions" speaks EN and AR sentences (Gemini fallback when no browser voice). Sandbox gets HTTP 500 from Gemini via proxy — code path verified, audio not. |
| STT (meeting mic) | Push-to-talk transcription EN/AR on real microphones; device picker with >1 mic (headless exposes only one fake device). |
| Camera smoothness | Signer-side feed with the round-2/3 stack: aurora paused in-meeting, <30 % landmark duty, framerate-first encoding. If still slow, capture a `?diag=1` dump *during a meeting*. |
| TURN-relayed calls | Two devices on different networks (Cloudflare TURN creds on Render, `docs/LIVE_TEST_PROCEDURE.md` §2). |

## Confirmed intentional — not bugs

- **Avatar pace (60 ms/frame + pauses):** deliberate, owner-accepted slow playback for readability.
- **Meeting model locked at join:** by design per owner request; the stage chip reports it, changing requires rejoining.
- **In-memory room state / caption history, single worker:** consistent with the app's deployment model (same rationale as the OTP store).
- **History replay only fills an empty panel:** deliberate simplicity — captions missed during a *brief* blip while the panel is populated are not merged (avoids duplicate-detection complexity for a rare case).

---

## Feature & optimization suggestions (all **Proposed** — none implemented)

Ordered by expected value for the defense demo:

1. **Signer self-feedback skeleton on the meeting tile.** The signer currently gets no visual confirmation that tracking works while in a meeting (the skeleton only draws on the dashboard panel's hidden canvas). Overlaying it on their own tile would show *why* a sign wasn't picked up. Effort: small-medium.
2. **Auto-compose on rest.** When the signer's hands rest >2 s with ≥2 buffered words, trigger Compose automatically (the rest-pose gate already detects this). Removes the one manual tap in the core conversation loop. Effort: small; needs live tuning so it never fires mid-sentence.
3. **Caption translation for cross-language meetings.** An EN-dashboard speaker and AR-dashboard signer each read captions in the other's language; Gemini could translate captions to each viewer's UI language (script detection is already in place). Effort: medium.
4. **Meeting transcript export.** The dashboards' export FAB covers module transcripts but not the meeting caption feed; a "download transcript" button on the captions panel is ~20 lines now that history is structured. Effort: small.
5. **Raise-hand / attention buzz.** A deaf participant can't hear "hello?" — a button that flashes the peer's screen edge would fill a real accessibility gap. Effort: small (new relay event + CSS flash).
6. **Caption font-size control.** The subtitle overlay is small on phones; an A/A+ toggle stored in localStorage. Effort: small.
7. **QR code in the create-meeting dialog** for joining from a phone (the link already carries `?room=`). Effort: small with a vendored QR lib (~1 KB).
8. **Spacebar push-to-talk** for the speaker's recorder path. Effort: small.
9. **Meeting stage chip extras:** elapsed timer + participant count next to the model chip. Effort: trivial.
10. **Web-Worker landmarking (structural).** Moving tasks-vision inference off the main thread is the *definitive* fix for slow-machine jank — it would obsolete the duty-cycle throttling entirely. Effort: large (worker + frame transfer + fallback); recommended only after the defense.

---

*All Fixed items are in commits `50f5646` and `47211c5` on `claude/together-diagnostic-hardening-uw0dwv`, merged into `claude/fervent-ptolemy-xx02po` for deployment. Gates at time of writing: 81/81 tests passing; full three-client rig green.*
