# Practice — Bug-Hunt & Testing Report (Phase 6)

**Scope:** `/practice` in both languages — round generation, target prompts, reference playback fallback, advance/skip flow, stats strip.

**How verified:** real browser against the real `/api/vocabulary`; the camera→model judging loop is the same production pipeline verified end-to-end with real clips in Phase 1 (module streaming) and is not duplicated here. Reference playback fallback exercised via the sandbox's 503s.

## Results

| Check | EN | AR |
|---|---|---|
| Round generated from live vocabulary, target word rendered | ✓ ("On", …) | ✓ ("مهم", …) |
| Advance/skip moves to a new target | ✓ | ✓ |
| Reference unavailable (503) → localized "no reference, try from memory" note | ✓ (verified earlier in the mobile audit shots) | ✓ |
| Page errors | none | none |
| Test suite | 81/81 | |

## Findings

**No new defects found.** (This page received the per-hand skeleton grace, rest-pose gate, ArSL default and word_ar/category_ar labeling fixes earlier in this project; all still in place.)

## Confirmed intentional
- Rounds of 10 with reshuffle each round; the judge is the production recognition model, not a looser comparison.

## Needs manual verification
| Item | Why |
|---|---|
| Full round with camera + live scoring on real hardware | needs a camera; model+socket layer proven in Phase 1. |
| ArSL reference videos for all 20 words | verified earlier via `tests/test_video_paths.py` + live spot-checks. |

## Suggestions (Proposed)
1. **Per-word hint** after two misses (slow-motion replay of the reference).
2. **Daily streak** (localStorage) shown next to round stats — cheap motivation loop.
3. **Adaptive rounds:** bias word selection toward historically low-confidence signs from the analytics log (both stores already exist client-side).
