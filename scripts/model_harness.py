"""Offline ground-truth harness for BOTH sign models, evaluated THROUGH the
production inference code (not a reimplementation of it).

Why this exists
---------------
`scripts/model_baseline_report.py --source db` reimplements the preprocessing
(pads to a fixed 60-frame window, adds a batch dim, leaves missing landmarks as
0.0) and scores ~3% top-1 — that is a harness artifact, NOT the model. The
validated serving contract lives in `app/server/asl_service.ASLService
.predict_sign` (variable-length (N,543,3), NaN for missing, softmax over raw
logits) and scores ~66.5% on the same rows. This harness calls the real
`predict_sign` / `predict_sign_from_landmarks` so any change to the serving
path is measured directly.

Known-good baselines (2026-07-01, this machine):
  ASL  (signs.db, 251 rows):  top1 = 0.6653  acceptance@0.50 = 0.542
  ArSL (signs_ar.db, 20 rows): top1 = 0.9500  (only miss: stop->finish @ 0.502)

ArSL w/h note: the Arabic training clips are 9:16 portrait; the predictor's
aspect transform divides x by 720 and y by 1280, so the harness passes
(720, 1280) — measured 95% vs 60% at (640,480) and 25% at (1280,720). Only the
aspect ratio matters (shoulder normalization cancels absolute scale).

Usage:
    python scripts/model_harness.py                # evaluate both models
    python scripts/model_harness.py --lang en
    python scripts/model_harness.py --min-en 0.66 --min-ar 0.95   # gate mode:
        exits non-zero if either model drops below its floor.
"""
from __future__ import annotations

import argparse
import contextlib
import io
import json
import pickle
import shutil
import sqlite3
import sys
import types
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE / "app" / "server"))
sys.path.insert(0, str(BASE))

# Same alias map as scripts/model_baseline_report.py (signs.db words that map
# to a differently-spelled model label).
ALIAS_TO_MODEL_KEY = {
    "call": "callonphone", "window": "glasswindow", "must": "haveto",
    "chicken": "hen", "he": "hesheit", "my": "minemy", "hurt": "owie",
    "repeat": "repeat that", "quiet": "shhh", "slow": "sign slower",
    "we": "weus", "understand": "i do not understand", "help": "i need help",
    "name": "my name is",
}

ARSL_W, ARSL_H = 720, 1280  # canonical portrait dims of the ArSL training clips


def reassemble_if_needed(db_path: Path) -> None:
    if db_path.exists():
        return
    part_a, part_b = Path(f"{db_path}.parta"), Path(f"{db_path}.partb")
    if part_a.exists() and part_b.exists():
        print(f"  reassembling {db_path} from parts...")
        with open(db_path, "wb") as out:
            for p in (part_a, part_b):
                with open(p, "rb") as f:
                    shutil.copyfileobj(f, out)


def normalize_candidates(value: str):
    raw = value.lower().strip()
    spaced = raw.replace("_", " ").replace("-", " ").strip()
    return [raw, spaced, "".join(spaced.split()), raw.replace("_", "").replace("-", "")]


def resolve_truth(source_name: str, key_set: set[str]):
    for c in normalize_candidates(source_name):
        if c in key_set:
            return c
    for c in normalize_candidates(source_name):
        m = ALIAS_TO_MODEL_KEY.get(c)
        if m and m in key_set:
            return m
    return None


def to_gislr(arr):
    """Row-major sqlite blob -> (N,543,3) in GISLR order face/lh/pose/rh.

    1629 = 543*3 already in GISLR order; 1662 = pose(33*4) + face(468*3) +
    lh(21*3) + rh(21*3) as written by scripts/build_db.py / build_arabic_db.py.
    """
    arr = np.asarray(arr, dtype=np.float32)
    if arr.ndim != 2:
        return None
    if arr.shape[1] == 1629:
        return arr.reshape(arr.shape[0], 543, 3)
    if arr.shape[1] == 1662:
        pose4 = arr[:, :132].reshape(-1, 33, 4)
        face = arr[:, 132:1536].reshape(-1, 468, 3)
        left = arr[:, 1536:1599].reshape(-1, 21, 3)
        right = arr[:, 1599:].reshape(-1, 21, 3)
        return np.concatenate([face, left, pose4[:, :, :3], right], axis=1)
    return None


def rows_from(db_path: Path):
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    try:
        return conn.execute(
            "SELECT word, landmarks FROM signs WHERE landmarks IS NOT NULL"
        ).fetchall()
    finally:
        conn.close()


def eval_asl() -> dict:
    from asl_service import ASLService

    labels_raw = json.loads(
        (BASE / "models" / "sign_to_prediction_index_map.json").read_text()
    )
    key_set = {str(k).lower() for k in labels_raw}

    # predict_sign only needs the TFLite side of ASLService; a stub sign_db
    # skips the Postgres + SBERT init so the harness runs anywhere.
    stub = types.SimpleNamespace(
        util=None, model=None, words=[], _word_set=set(),
        skip_semantic_match=set(), exact_match_map={},
    )
    svc = ASLService(sign_db=stub)
    prod_thresh = svc.CONFIDENCE_THRESH
    svc.CONFIDENCE_THRESH = -1.0  # get the argmax label out regardless of threshold

    db_path = BASE / "data" / "signs.db"
    reassemble_if_needed(db_path)
    n = correct = accepted = accepted_correct = skipped = failed = 0
    for word, blob in rows_from(db_path):
        truth = resolve_truth(word, key_set)
        if truth is None:
            skipped += 1
            continue
        seq = to_gislr(pickle.loads(blob))
        if seq is None:
            failed += 1
            continue
        with contextlib.redirect_stdout(io.StringIO()):  # predict_sign prints per call
            label, conf = svc.predict_sign(seq.tolist())
        if label is None:
            failed += 1
            continue
        n += 1
        ok = label.lower() == truth
        correct += ok
        if conf > prod_thresh:
            accepted += 1
            accepted_correct += ok
    return {
        "model": "asl", "evaluated": n, "skipped_unmapped": skipped, "failed": failed,
        "top1": correct / n if n else 0.0,
        "acceptance_rate": accepted / n if n else 0.0,
        "accepted_precision": accepted_correct / accepted if accepted else 0.0,
        "threshold": prod_thresh,
    }


def eval_arsl() -> dict:
    from models.sign_predictor import SignLanguagePredictor

    pred = SignLanguagePredictor(
        model_path=str(BASE / "models" / "best_model.pth"),
        class_mapping_path=str(BASE / "models" / "class_mapping.json"),
    )
    n = correct = accepted = 0
    misses = []
    for word, blob in rows_from(BASE / "data" / "signs_ar.db"):
        seq = to_gislr(pickle.loads(blob))
        if seq is None:
            continue
        label, conf = pred.predict_sign_from_landmarks(seq.tolist(), ARSL_W, ARSL_H)
        n += 1
        if label is not None:
            accepted += 1
            if label.lower() == word.lower():
                correct += 1
            else:
                misses.append((word, label, round(float(conf), 3)))
        else:
            misses.append((word, None, 0.0))
    return {
        "model": "arsl", "evaluated": n,
        "top1": correct / n if n else 0.0,
        "acceptance_rate": accepted / n if n else 0.0,
        "misses": misses,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--lang", choices=["en", "ar", "both"], default="both")
    ap.add_argument("--min-en", type=float, default=None,
                    help="exit 1 if ASL top1 falls below this floor")
    ap.add_argument("--min-ar", type=float, default=None,
                    help="exit 1 if ArSL top1 falls below this floor")
    args = ap.parse_args()

    ok = True
    if args.lang in ("en", "both"):
        r = eval_asl()
        print(f"ASL  top1={r['top1']:.4f} ({r['evaluated']} samples) "
              f"acceptance@{r['threshold']}={r['acceptance_rate']:.4f} "
              f"accepted_precision={r['accepted_precision']:.4f} "
              f"skipped={r['skipped_unmapped']} failed={r['failed']}")
        if args.min_en is not None and r["top1"] < args.min_en:
            print(f"ASL REGRESSION: top1 {r['top1']:.4f} < floor {args.min_en}")
            ok = False
    if args.lang in ("ar", "both"):
        r = eval_arsl()
        print(f"ArSL top1={r['top1']:.4f} ({r['evaluated']} samples) "
              f"acceptance@0.45={r['acceptance_rate']:.4f} misses={r['misses']}")
        if args.min_ar is not None and r["top1"] < args.min_ar:
            print(f"ArSL REGRESSION: top1 {r['top1']:.4f} < floor {args.min_ar}")
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
