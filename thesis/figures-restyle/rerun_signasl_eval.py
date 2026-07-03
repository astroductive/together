"""Re-run the SignASL baseline evaluation, dumping EVERY per-clip prediction
(true, pred, top-5, confidences) so the full confusion structure is real data.
Reuses the repo's own scripts/model_baseline_report.py functions unchanged."""
import sys, json, time
import numpy as np
sys.path.insert(0, "/home/user/together/scripts")
from model_baseline_report import (
    load_label_maps, resolve_truth_label_key, resolve_holistic_class,
    extract_landmarks_from_video, MODEL_PATH, LABEL_MAP_PATH, VIDEO_DIR,
)
from ai_edge_litert.interpreter import Interpreter
from pathlib import Path

OUT = "/tmp/claude-0/-home-user-together/61c624f1-8ea0-5623-839e-0c603dccb241/scratchpad/full_eval_rows.json"

key_to_idx, idx_to_key = load_label_maps(LABEL_MAP_PATH)
videos = sorted(Path(VIDEO_DIR).glob("*.mp4"))
items = []
for v in videos:
    tk = resolve_truth_label_key(v.stem, key_to_idx)
    if tk is not None:
        items.append((v, tk, key_to_idx[tk]))
print(f"mapped {len(items)} of {len(videos)} clips", flush=True)

interp = Interpreter(model_path=str(MODEL_PATH))
interp.allocate_tensors()
ind, outd = interp.get_input_details(), interp.get_output_details()

rows = []
hol_cls = resolve_holistic_class()
t0 = time.time()
with hol_cls(model_complexity=1, min_detection_confidence=0.6,
             min_tracking_confidence=0.6) as hol:
    for i, (vp, tk, ti) in enumerate(items, 1):
        seq = extract_landmarks_from_video(vp, hol)
        if seq is None:
            rows.append({"clip": vp.name, "true": tk, "failed": True})
            continue
        batch = np.expand_dims(seq, 0).astype(ind[0]["dtype"])
        interp.resize_tensor_input(ind[0]["index"], batch.shape)
        interp.allocate_tensors()
        interp.set_tensor(ind[0]["index"], batch)
        interp.invoke()
        out = np.squeeze(interp.get_tensor(outd[0]["index"])).astype(np.float64)
        sm = np.exp(out - out.max()); sm /= sm.sum()
        top5 = np.argsort(sm)[::-1][:5]
        rows.append({
            "clip": vp.name, "true": tk,
            "pred": idx_to_key[int(top5[0])],
            "correct": bool(int(top5[0]) == ti),
            "conf": float(sm[top5[0]]),
            "top5": [[idx_to_key[int(j)], float(sm[j])] for j in top5],
            "true_rank": int(np.where(np.argsort(sm)[::-1] == ti)[0][0]) + 1,
        })
        if i % 25 == 0:
            acc = sum(r.get("correct", False) for r in rows) / len(rows)
            print(f"{i}/{len(items)}  running-acc={acc:.3f}  "
                  f"{(time.time()-t0)/i:.1f}s/clip", flush=True)

json.dump(rows, open(OUT, "w"), indent=1)
n = sum(1 for r in rows if not r.get("failed"))
acc = sum(r.get("correct", False) for r in rows) / n
print(f"DONE eval={n} top1={acc:.4f} runtime={time.time()-t0:.0f}s -> {OUT}", flush=True)
