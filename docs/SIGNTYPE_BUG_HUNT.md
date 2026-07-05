# SignType (Text → Sign) — Bug-Hunt & Testing Report (Phase 3)

**Scope:** dashboard module 3 in both languages — text input → LLM gloss (with fallback) → sign batch lookup → avatar canvas playback, history, missing-word feedback, re-entry guards.

**How verified:** in-browser E2E with the batch endpoint stubbed with **real landmark sequences from `signs.db` / `signs_ar.db`** (Postgres-backed lookup is unreachable in the sandbox); playback verified by sampling the canvas pixels mid-animation.

---

## End-to-end results

| Check | EN | AR |
|---|---|---|
| Avatar canvas actually paints the sign (lit pixels mid-play) | **✓** 33,798 px | **✓** 35,292 px |
| Word label + progress overlay + placeholder hidden during play | ✓ | ✓ |
| History row added for the typed text | ✓ | ✓ |
| **⚠ "Not in the sign dataset"** entry for unknown words (this session's fix) | ✓ | ✓ |
| Busy guard: submit while playing is ignored, input text preserved | ✓ | ✓ |
| Gloss LLM fallback (string response → naive word split) | ✓ | ✓ |
| Test suite | 81/81 | |

## Findings

### No new defects found in this phase.

The two defects that would have appeared here were already caught and fixed earlier in this session's sweep and are re-verified above:
- unknown words previously vanished silently → now a visible ⚠ history entry (both languages);
- history rows previously interpolated typed text into `innerHTML` unescaped → now escaped (`escHtml`, Phase 1 fix).

## Verified clean (no action)

- **Re-entry discipline:** `avatarPlaying` blocks concurrent playback; the pending input is *not* cleared, so nothing is lost.
- **Gloss robustness:** when `/api/gloss` fails or returns a non-array (the server's no-LLM fallback returns a string), the client falls back to plain tokenization — no crash, playback proceeds.
- **Status-code handling:** 401/403 (session expired), 503 (sign DB warming up) and generic errors each produce a distinct, accurate status message.

## Confirmed intentional

- **Playback pace (60 ms/frame + word pauses):** owner-accepted slow, readable pace.
- **`im` → `i am` expansion** in naive tokenization: deliberate vocabulary mapping.

## Needs manual verification

| Item | Why |
|---|---|
| Real batch endpoint under Postgres | Sandbox has no Postgres; the endpoint's contract (found/missing/landmarks) is exercised in production and by `tests/`. |
| Gemini gloss quality (Topic-Comment ordering) | No Gemini egress in sandbox; fallback path verified instead. |

## Feature / optimization suggestions (Proposed)

1. **Queue instead of ignore:** a submit during playback could enqueue (like the meeting avatar's sentence queue) rather than silently no-op — the input is preserved today, but nothing tells the user to press Enter again.
2. **Server gloss fallback shape:** the no-LLM fallback returns `gloss` as a string while the success path returns an array; returning a list consistently would simplify clients (client already guards, so this is cleanup, not a bug).
3. **Playback speed control:** a 1×/1.5×/2× toggle for experienced users, persisted in localStorage; the 60 ms default stays.
4. **Word-by-word replay:** clicking a word in the history could replay just that word (the per-word clips are already fetched).

---

*E2E rig: `scratchpad/pwrig/signtype.mjs` (stubs the batch route with real `signs.db` data).* 
