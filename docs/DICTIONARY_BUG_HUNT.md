# Dictionary — Bug-Hunt & Testing Report (Phase 5)

**Scope:** `/dictionary` in both languages — vocabulary grid, search, filters, entry modal, playback fallback messaging.

**How verified:** real browser against the real `/api/vocabulary` endpoint (works in-sandbox); playback endpoints are Postgres-backed and return 503 here, which exercises the graceful-degradation path. (Landmark/video playback itself is proven with real data in Phases 3–4 and the meeting avatar tests, which share the player.)

## Results

| Check | EN | AR |
|---|---|---|
| Grid renders the full vocabulary (270 cards: 250 ASL + 20 ArSL) | ✓ | ✓ |
| Search narrows correctly ("tv" → 1 card) — matches EN word and AR translation | ✓ | ✓ |
| Entry modal opens with word, category, language chip | ✓ | ✓ |
| Clip unavailable (503) → clear localized message, no crash | "No animation available for this sign yet" | "لا يتوفر رسم متحرك لهذه الإشارة بعد" |
| Page errors | none | none |
| Test suite | 81/81 | |

## Findings

**No defects found.** The feature degraded exactly as designed with the sign store offline and behaved correctly with live vocabulary data.

## Confirmed intentional
- ASL entries play recorded landmark animations; ArSL entries play real video clips (`/api/videos/…`) — different media by design.

## Needs manual verification
| Item | Why |
|---|---|
| Clip playback for all 270 entries against production Postgres | sandbox has no Postgres; the 20 ArSL videos were verified earlier in this project (path-fix phase + `tests/test_video_paths.py`). |

## Suggestions (Proposed)
1. **Recently-viewed strip** (localStorage) at the top of the grid.
2. **"Practice this sign" button** in the modal, deep-linking into Practice with that word as the first target.
3. **Keyboard navigation** (arrows + Enter) across the grid for accessibility.
