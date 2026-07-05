# TalkSide (Speech → Sign) — Bug-Hunt & Testing Report (Phase 4)

**Scope:** dashboard module 4 in both languages — push-to-talk recording (device picker + live level meter), backend STT, and the speech→avatar animation path.

**How verified:** real browser with a fake microphone device (recording lifecycle, meter, STT request), avatar playback against real `signs.db` landmark data, and a race test for concurrent transcripts.

---

## End-to-end results

| Check | Result |
|---|---|
| Record → button/status/meter state → Stop → `/api/stt` request fired | **✓** (meter honestly reads 0% on the silent fake device) |
| Transcription error surfaced when STT fails (sandbox: Gemini blocked) | ✓ |
| Avatar canvas plays real landmark data (32,535 lit px mid-play) | ✓ |
| Concurrent transcript **queues** instead of interleaving (new fix) | ✓ |
| Test suite | 81/81 |

## Findings, by severity

### MEDIUM

#### 1. A transcript arriving during playback animated **concurrently** on the same canvas
- **Description:** `s2sAnimateText` had a queue *drain* (`pendingSpeechText`) at the end but no *entry guard* — a second record→transcribe cycle finishing while the previous sentence was still animating started a second `playLandmarkSequence` loop on the same canvas, interleaving the two signs' frames into gibberish.
- **Repro:** record twice quickly; watch both animations fight over the canvas.
- **Root cause:** guard existed for the (removed) live-recognition path, not the backend push-to-talk path.
- **Fix:** entry guard added — while playing, the new transcript is stored in `pendingSpeechText` and the existing drain plays it next. Both dashboards.
- **Risk:** very low.
- **Status:** **Fixed** (verified: second call returns immediately, plays after the first).

### LOW

#### 2. STT transcript interpolated into `innerHTML` unescaped
- Same class as Phases 1–2 (the transcript is Gemini output of the user's own speech). `escHtml` applied, both dashboards.
- **Status:** **Fixed**.

## Verified clean (no action)

- **Device picker + meter:** mic list populates after permission; `OverconstrainedError`/`NotFoundError` produce the "pick another microphone" message; meter tears down with the stream on stop.
- **Recorder lifecycle:** `onstop` completes transcription even though `stopMic()` nulls the recorder reference immediately (closure holds the stream); empty recordings are dropped with a console note.
- **Status-code discipline:** non-OK STT throws into the visible "Transcription error" path.

## Confirmed intentional

- **Push-to-talk everywhere (no continuous Web Speech):** deliberate — Chrome's live API can't target a chosen microphone; the recorded path can, and the meter proves the mic is live. (The meeting mic keeps continuous EN on the *default* device by design; TalkSide is the device-selectable flow.)

## Needs manual verification

| Item | Why |
|---|---|
| Real transcription quality EN/AR | Gemini egress blocked in sandbox; request formation verified. |
| Multi-microphone picker | Headless exposes one fake device; picker logic verified by code path + meeting-mic testing. |

## Feature / optimization suggestions (Proposed)

1. **Auto-stop on silence:** end the recording automatically after ~1.5 s below the meter's noise floor — one tap instead of two per utterance.
2. **Push-to-talk hotkey** (hold Space to record) — shared suggestion with the meeting mic.
3. **Transcript edit-before-animate:** show the transcript with a 2 s "edit" window before animating, so STT errors can be corrected without re-recording.

---

*E2E rig: `scratchpad/pwrig/talkside.mjs`.*
