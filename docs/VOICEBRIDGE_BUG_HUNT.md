# VoiceBridge (Sign → Speech) — Bug-Hunt & Testing Report (Phase 2)

**Scope:** dashboard module 2 in both languages — independent camera/streaming pipeline (`module: speech`), gloss buffer, sentence compose, TTS + replay, spoken-sentence log.

**How verified:** real-model E2E (known-good `signs.db` clip streamed over the socket on the `speech` module), UI chain driven through the page's own functions, and a forced-failure test with the sentence API blocked.

---

## End-to-end results

| Path | Result |
|---|---|
| Socket streaming on `module: speech` → TFLite → `sign_detected` | **✓** "animal" detected correctly (independent per-module server state confirmed) |
| UI: detection → chips → tap-to-remove → compose → sentence box → spoken-log | **✓** all steps verified |
| TTS pipeline (browser voice → backend fallback) | **✓ attempted** — 3 `/api/tts` requests observed incl. replay (audio itself: needs manual verification, Gemini blocked in sandbox) |
| Compose failure recovery | **✓ after fix** — see #1 |
| Test suite | 81/81 |

---

## Findings, by severity

### MEDIUM

#### 1. Compose failure silently ate the signed words and stuck the UI on "Forming sentence…"
- **Description:** The gloss buffer is cleared optimistically when Compose is pressed. If `/api/translate/sentence` failed (non-OK status), the function returned early: the words were gone, the sentence box showed "Forming sentence…" forever, and the user had to re-sign everything. A thrown error (network) showed the error message but *also* lost the words.
- **Repro:** buffer two signs → block the sentence endpoint → Compose.
- **Root cause:** `if (!res.ok) return;` skipped both the error display and any buffer restore; the catch block restored nothing.
- **Fix:** non-OK now throws into the shared catch; the catch **restores the words to the buffer** (re-rendered as chips) and shows the error. Applied to *both* the VoiceBridge and the HandScript compose (same defect class), in both dashboards.
- **Verified:** with the endpoint blocked, chips come back (`["teacher","school"]`), the error message shows, and the Compose button re-enables.
- **Status:** **Fixed**.

#### 2. Module-1 in-meeting sentence relay missed `senderName`
- **Description:** Composing via the HandScript panel while in a meeting relayed the sentence without the sender's name (receivers fell back to presence data, which usually — but not always — resolves).
- **Fix:** `senderName` added to that emit, both dashboards (all meeting emits now carry it).
- **Status:** **Fixed**.

### LOW

#### 3. Unescaped `innerHTML` interpolation (sentence box + spoken-sentence log)
- **Description:** Same class as Phase 1's finding: the composed sentence (Gemini output) and log rows were interpolated unescaped — a `<` in the LLM's output would break rendering.
- **Fix:** `escHtml()` applied at both sites, both dashboards.
- **Status:** **Fixed**.

## Verified clean (no action)

- **Per-module isolation:** `(sid, module)` keyed server state means the speech panel's stream never crosses with the vision panel's — confirmed by running module `speech` E2E while module `vision` state existed.
- **Arabic parity:** the AR dashboard's VoiceBridge accumulates + composes exactly like English (the old clear-per-word behavior remains removed); compose language flows to the Arabic-aware endpoint.
- **Rest-pose gate + per-hand skeleton grace:** present in the s2sp pipeline like module 1.
- **Replay button:** replays the last sentence in the last language through the same TTS path.

## Needs manual verification

| Item | Why |
|---|---|
| Spoken audio quality (EN + AR voices, Gemini fallback) | No Gemini egress in the sandbox; requests fire correctly. |
| Live camera accuracy | Same as Phase 1 — sandbox streams DB clips, not camera video. |

## Feature / optimization suggestions (Proposed)

1. **Auto-speak on rest:** like the meeting auto-compose idea — when the signer rests with ≥2 buffered words, compose and speak automatically; VoiceBridge is the feature where hands-free completion matters most.
2. **Voice picker inline:** the global TTS voice choice (`setTtsVoice`) exists but is buried in settings; surface a small voice dropdown next to the Speak button.
3. **Sentence history re-speak:** tapping a row in the spoken-sentence log could re-speak it (data is already stored).

---

*Fixes in this phase are in the same commit as this file. E2E rig: `scratchpad/pwrig/voicebridge.mjs`.*
