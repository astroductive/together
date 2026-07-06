# HandScript (Sign → Text) — Bug-Hunt & Testing Report (Phase 1)

**Scope:** dashboard module 1 in both languages — camera pipeline, socket streaming + HTTP fallback, rest-pose gate, gloss chips, sentence compose, session log, confidence widgets, and the server-side streaming recognizer.

**How verified:** this phase ran the **real models end-to-end** in the sandbox for the first time: known-good clips from `signs.db` / `signs_ar.db` were converted to the exact page wire format and streamed as `sign_frame` events from a real browser through the real socket into the real TFLite / CNN-GRU predictors. UI behavior was driven through the page's own functions.

---

## End-to-end results (the headline)

| Path | Result |
|---|---|
| EN socket streaming → TFLite → vote → `sign_detected` | **3/3 correct** ("TV"@0.86, "animal"@0.94, "another"@0.77) |
| AR socket streaming → CNN-GRU → vote → `sign_detected` | "baby" → **طفل ✓**; "eat" → see finding #1 |
| HTTP fallback `/api/translate` (socket down) | **✓** "animal"@0.98, 59 ms server time |
| UI: detections → chips → tap-to-remove → compose → transcript → session log | **✓** all steps verified in-browser |
| Test suite | 81/81 |

---

## Findings, by severity

### MEDIUM

#### 1. Long Arabic gestures can emit a wrong word *before* the right one (streaming early-commit)
- **Description:** Streaming a real "eat" clip frame-by-frame produced "good"@0.99 at ~15 frames, then "eat"@0.99 once the rolling window covered the full motion. The early portion of a long gesture can genuinely look like a different (shorter) sign at high confidence.
- **Repro:** Stream `signs_ar.db`'s "eat" clip through `sign_frame`; watch `sign_detected` fire twice.
- **Root cause:** Live streaming must commit before the gesture ends (that's what makes it feel real-time). The 3-vote buffer fills within ~75 ms from nearly-identical windows, so a partial-window prediction can self-confirm.
- **Proposed fix — tried and rejected:** Spacing Arabic votes 0.22 s apart was implemented and measured: it made things *worse* (the phantom still won and the correct "eat" never re-fired before the clip ended). Reverted; the knob remains available as `STREAM_MIN_INTERVAL_AR_S` for future experiments.
- **Mitigation in place:** detection flushes the buffer + 8-frame cooldown (the *next* window is fresh), the rest-pose gate kills idle-posture phantoms, and transcript chips are tap-to-remove — the designed correction path.
- **Risk of leaving as-is:** occasional extra word on long ArSL signs; user-correctable in one tap.
- **Status:** **FIXED via gesture segmentation** (follow-up phase). Both dashboards now start ArSL vision streams with `{segmented: true}`: a client-side wrist-motion detector marks gesture boundaries (~300 ms stillness, hands dropped, or entering rest) and the server's new `sign_boundary` event classifies each full boundary-to-boundary segment exactly once (no mid-gesture voting; low-cadence `sign_conf` pulses keep the confidence ring alive). Continuous mode is unchanged for every other caller (Practice page, HTTP fallback, old clients) and remains the documented tradeoff there. Sandbox-verified with the real model through the production socket: the "eat" clip that yields `good, eat` in continuous mode produces **zero mid-stream commits and exactly one boundary commit = eat@1.00** in segmented mode; fragments under 15 frames are discarded; harness gate unchanged (ASL 0.6653 / ArSL 0.95).

### LOW

#### 2. Unescaped text interpolated into `innerHTML` (session log, Text→Sign history, speech output)
- **Description:** Composed sentences and user-typed Text→Sign input flow into `innerHTML` template literals unescaped; a stray `<` breaks row rendering and typed markup executes (self-XSS — only the typing user is affected).
- **Root cause:** `${s.text}` / `${h.text}` / `${nextText}` interpolation without escaping.
- **Fix:** added `escHtml()` and wrapped all three interpolation sites in **both** dashboards.
- **Risk:** none — display-only change.
- **Status:** **Fixed**.

#### 3. (From this phase's meeting-adjacent sweep) keyboard-shortcuts FAB covered the sidebar's Sign Out button
- **Fix:** the ⌨ button joined the shared bottom-end floating cluster; verified no overlap at 1366×900.
- **Status:** **Fixed** (shipped with the product-pages commit).

## Verified clean (no action)

- **Buffer hygiene on hand-gap / rest / language switch:** hand-gap clears sequence+votes and resets the server buffer; entering rest-pose does the same; switching model language mid-camera restarts the server stream state with the new language. All confirmed by code path and consistent with the E2E behavior.
- **HTTP fallback discipline:** results arriving after the camera stopped, or after streaming took over, are discarded (no duplicate detections at the changeover).
- **Detect-state pill:** "No hands detected" appears after ~2 s without hands; "Hands resting — paused" during rest gate; verified logic intact in both languages.
- **Per-hand skeleton grace:** ghost-skeleton fix from the earlier phase still in place; payload uses raw (unsmoothed) frames.
- **Meeting reuse:** in-meeting the module reuses the meeting camera stream (single capture) with the adaptive duty-cycle loop.

## Needs manual verification

| Item | Why |
|---|---|
| Live camera accuracy on real hardware | The sandbox streams database clips, not camera video; live MediaPipe output differs per machine/lighting. The existing `?diag=1` dump + replay flow covers this. |
| Gemini sentence compose quality | `/api/translate/sentence` falls back to word-joining in the sandbox (no Gemini egress); wiring verified, LLM output not. |

## Feature / optimization suggestions (Proposed)

1. **Gesture segmentation for ArSL** — **IMPLEMENTED** (see finding #1 status): boundary detector in both dashboards + opt-in `segmented` stream mode and `sign_boundary` handler in `main.py`.
2. **Per-word confidence chips:** tint each transcript chip by its detection confidence (data already flows through `handleDetectedSign`) so users see which words to double-check before composing.
3. **Undo for tap-to-remove** — **IMPLEMENTED**: removing a chip (HandScript transcript or VoiceBridge gloss, both dashboards) shows a 5-second toast whose Undo button restores the word at its original position.
4. **Auto-compose on rest** — shared with the meeting suggestion list; the rest gate already knows when the signer stopped.

---

*E2E rig: `scratchpad/pwrig/handscript.mjs` (kept out of the repo; reproducible from `docs/LIVE_TEST_PROCEDURE.md` + this report). Fixes in this phase are in the same commit as this file.*

---

## Follow-up round: "worked once, weird signs later" (extensive state-machine test)

User-reported: a sign works on the first attempt, later attempts transcribe wrong words (both ASL and ArSL). A 5-lens adversarial code review + a state-machine E2E rig (real model, production socket: repeats with idle gaps, still-hands filler, raise-then-hold, back-to-back words, boundary semantics) reproduced and fixed:

1. **AR phantom words from still hands held in signing space** (pre-existing, the core "weird signs"): the ArSL model classifies frozen postures at high confidence — measured **5 phantom commits per 100 still frames**; a raise-then-hold ("thinking pose") committed phantoms too. Fix: server-side stillness gate — wrist+fingertip motion tracked per arriving frame (MAX across points; mean diluted one-hand/finger motion and broke real gestures); after 6 consecutive still frames the stream pauses (no buffering, no inference) until motion resumes; a pause ≥ 1s flushes the window on resume so a think-pause can't leak the previous gesture's tail into the next. Verified: 0 phantoms in every still/raise-hold scenario, all legitimate detections intact (both languages, 14/14 rig checks).
2. **Segmented boundary classified junk segments**: raise-then-hold armed the client's motion detector and the boundary committed a phantom at conf 0.97. Fixes: server trims leading/trailing still frames off each segment and discards cores < MIN_SEQ; client requires ≥ 8 moving frames before a boundary (else it resets); one-shot commits get a 0.6 confidence floor (`SEG_MIN_CONF`) since no vote consensus backs them.
3. **Boundary lost/contaminated under the busy race**: `sign_boundary` used to no-op while the low-cadence conf inference held `busy` (~every 250 ms), dropping the commit AND leaking the segment into the next one. Fix: snapshot+clear at handler entry, bounded wait for the engine, stale-state guard.
4. **Client dedup swallowed legitimate repeats**: `lastAccepted`/`sameSignCount` never reset on hand drop or rest, so re-signing the same word later needed 3 attempts (users read this as "it stopped working"). Fix: dedup resets on hand gap, rest entry, and each segment boundary.
5. **Stale inference results crossing resets/language switches**: an in-flight inference could vote into a freshly cleared buffer or emit under a replaced stream state. Fix: per-state `epoch` + identity revalidation after every await.
6. **SignType "same input, different signs"**: single-word input now bypasses the LLM glosser entirely and gloss runs at temperature 0 (was 0.2) — the same text glosses identically run-to-run. Also fixed: ▶ replay on ⚠ warning rows animated the literal warning text; double-click during the fetch window started two interleaved playbacks (avatar is now claimed before any await); replay no longer clobbers text the user is typing; AR batch words whose translation cleaned to nothing vanished silently (now listed in `missing`); Arabic diacritics/tatweel/punctuation are stripped before dictionary lookup.

**Accepted tradeoffs (documented, not bugs):** adjacent signs merge if the inter-sign pause is under ~300 ms (6 frames); segments whose trimmed core is < 15 frames are dropped (ultra-fast signs — repeat the sign); duplicate commits of the same word in EN continuous mode remain possible on gesture tails (chips are tap-to-remove); a deliberate slow drift can still classify as *some* word — a closed-vocabulary model has no background class.

Gates after the round: pytest 86/86, harness ASL 0.6653 / ArSL 0.95 (unchanged), state-machine rig 14/14, segmentation rig 7/7, SignType rig 3/3, feature-batch rig all green.
