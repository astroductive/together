"""Replay a browser SignDiag dump through the PRODUCTION predictors.

Workflow: enable diagnostics in the browser (?diag=1 on the dashboard or
practice URL), sign for a while, click "download diag dump" in the HUD, then:

    python scripts/replay_live_dump.py sign-diag-....json
    python scripts/replay_live_dump.py sign-diag-....json --expect hello

The dump contains the EXACT frames the browser sent (post-preparePayload:
543 landmarks for English, 59 for Arabic). This script feeds them through the
same code the server runs (ASLService.predict_sign / SignLanguagePredictor
.predict_sign_from_landmarks), so:

  - offline harness good + replay good  -> live format matches training; any
    remaining live problem is detection rate / latency, not encoding.
  - offline harness good + replay bad   -> live format still diverges from
    training (mirroring / encoding / w,h); diff the dump against signs.db.
"""
from __future__ import annotations

import argparse
import contextlib
import io
import json
import sys
import types
from collections import Counter
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE / "app" / "server"))
sys.path.insert(0, str(BASE))


def load_frames(dump: dict, module: str | None):
    entries = dump.get("payloadFrames", [])
    if module:
        entries = [e for e in entries if e.get("module") == module]
    frames = [e["frame"] for e in entries if e.get("frame")]
    meta = next((e.get("meta") for e in entries if e.get("meta")), {}) or {}
    return frames, meta


def replay_asl(frames):
    from asl_service import ASLService
    stub = types.SimpleNamespace(util=None, model=None, words=[], _word_set=set(),
                                 skip_semantic_match=set(), exact_match_map={})
    svc = ASLService(sign_db=stub)

    print(f"\n== ASL replay: {len(frames)} captured frames ==")
    # Sliding 60-frame windows, step 15 — approximates the live rolling buffer.
    results = []
    step, win = 15, 60
    starts = range(0, max(1, len(frames) - win + 1), step)
    for s in starts:
        window = frames[s:s + win]
        with contextlib.redirect_stdout(io.StringIO()):
            label, conf = svc.predict_sign(window)
        results.append((s, label, conf))
        print(f"  window @{s:4d} ({len(window)} frames): "
              f"{label or '—':<20} conf={conf:.3f}")
    accepted = [r[1] for r in results if r[1]]
    print(f"accepted {len(accepted)}/{len(results)} windows: {Counter(accepted).most_common(5)}")
    return accepted


def replay_arsl(frames, w, h):
    from models.sign_predictor import SignLanguagePredictor
    pred = SignLanguagePredictor(
        model_path=str(BASE / "models" / "best_model.pth"),
        class_mapping_path=str(BASE / "models" / "class_mapping.json"),
    )
    print(f"\n== ArSL replay: {len(frames)} captured frames, w={w} h={h} ==")
    results = []
    step, win = 15, 60
    starts = range(0, max(1, len(frames) - win + 1), step)
    for s in starts:
        window = frames[s:s + win]
        label, conf = pred.predict_sign_from_landmarks(window, w, h)
        results.append((s, label, conf))
        print(f"  window @{s:4d} ({len(window)} frames): "
              f"{label or '—':<12} conf={float(conf):.3f}")
    accepted = [r[1] for r in results if r[1]]
    print(f"accepted {len(accepted)}/{len(results)} windows: {Counter(accepted).most_common(5)}")
    return accepted


def encoding_report(frames):
    """Sanity-check the captured payload against the expected wire format."""
    arr_lens = Counter(len(f) for f in frames)
    print(f"frame landmark counts: {dict(arr_lens)} (543=English full, 59=Arabic compact)")
    sample = np.array([[np.nan if v is None else v for v in pt] for pt in frames[0]],
                      dtype=np.float32)
    nan_pct = float(np.mean(np.isnan(sample))) * 100
    zero_pct = float(np.mean(sample == 0.0)) * 100
    print(f"first frame: NaN(null)={nan_pct:.1f}%  zeros={zero_pct:.1f}%  "
          f"x_range=({np.nanmin(sample[:, 0]):.3f},{np.nanmax(sample[:, 0]):.3f})")
    if zero_pct > 30:
        print("  WARNING: high zero share — missing landmarks may be arriving as 0.0 "
              "instead of null (the ASL NaN safety net would mask a detection failure).")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("dump", help="sign-diag-*.json downloaded from the browser HUD")
    ap.add_argument("--module", default=None, help="filter: vision | speech")
    ap.add_argument("--lang", choices=["en", "ar", "auto"], default="auto")
    ap.add_argument("--expect", default=None, help="the word you were signing")
    args = ap.parse_args()

    dump = json.loads(Path(args.dump).read_text())
    print("browser summary:", json.dumps(dump.get("summary", {}), indent=1))
    frames, meta = load_frames(dump, args.module)
    if not frames:
        print("No payload frames in dump (was the camera on with ?diag=1 enabled?)")
        return 1
    encoding_report(frames)

    lang = args.lang
    if lang == "auto":
        lang = "ar" if len(frames[0]) == 59 or str(meta.get("language", "")).startswith("ar") else "en"

    if lang == "ar":
        accepted = replay_arsl(frames, int(meta.get("w") or 640), int(meta.get("h") or 480))
    else:
        accepted = replay_asl(frames)

    if args.expect:
        hit = any(args.expect.lower() == a.lower() for a in accepted)
        print(f"\nexpected '{args.expect}': {'DETECTED' if hit else 'NOT DETECTED'}")
        return 0 if hit else 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
