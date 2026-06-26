# Gaps & Questions — items only YOU can supply before submission

This file lists everything the thesis needs that is **not present in the repository**,
or that must be **verified** before the document is submitted. Each item appears in the
thesis as a visible inline marker — `⚠️ GAP`, `⚠️ PLACEHOLDER`, or `⚠️ VERIFY` — so you
can find and fix it. Items are grouped by severity.

Legend:
- **GAP** — information the thesis needs but the repo does not contain.
- **PLACEHOLDER** — a figure/table inserted with illustrative (non-real) data, clearly labelled, to be replaced with real artifacts.
- **VERIFY** — a claim/citation that is plausible but must be confirmed against a primary source.

---

## A. Front-matter / administrative (quick to fill)

| # | Item | Where in thesis | What is needed |
|---|------|-----------------|----------------|
| A1 | **Co-supervisor / second supervisor** | Title page, Declaration | Only one supervisor (Prof. Medhat Awadallah) was provided. If there is a co-supervisor or teaching assistant, add them; otherwise the second supervisor row is left blank. Marked `[SECOND SUPERVISOR — if any]`. |
| A2 | **Department wording** | Title page, Declaration | The FUE template reads "Department of Electrical Engineering … Electronics and Communication". Your brief specifies **Computers & Intelligent Systems Engineering**. The thesis uses your wording — confirm it matches your department's exact official name and degree title. |
| A3 | **Exact submission date** | Title page | Set to **7 July 2026** per your brief. Confirm. |
| A4 | **Declaration date / signatures** | Declaration page | Each author must sign and date the printed copy (`[DATE]` placeholder present). |

## B. Datasets & training (most important — these are real research gaps)

| # | Item | Severity | Detail |
|---|------|----------|--------|
| B1 | **ASL training dataset provenance** | GAP / VERIFY | The 250-class model is described in code as *"GISLR-style"* (`asl_service.py`) and uses exactly the 250-sign label set and 543-landmark MediaPipe Holistic representation of the **Google – Isolated Sign Language Recognition (PopSign ASL)** Kaggle competition. The repo does **not** cite the dataset explicitly. Confirm the exact source, version, licence, and whether `model.tflite` was trained by your team or adapted from a public checkpoint. |
| B2 | **ArSL training dataset provenance** | GAP | The 20-class Egyptian ArSL model (`best_model.pth`) was trained on word videos referenced in `scripts/build_arabic_db.py` (a local `archive/dataset` path). The dataset **source, size, number of signers, recording conditions, consent, and demographics are not documented**. Supply these. |
| B3 | **Train / validation / test split** | GAP | No split ratios, counts, or methodology are recorded for either model. Provide the number of samples per class and the split used. |
| B4 | **Training hyperparameters (BOTH models)** | GAP | Epochs, optimizer, learning rate, batch size, loss function, LR schedule, augmentation, early-stopping, and hardware are **not in the repo** (only the trained checkpoints ship). Fill the hyperparameter table in §3.5 (currently `⚠️ GAP` placeholders). |
| B5 | **`data/signs_videos` vs training data** | VERIFY | The MP4 clips in `data/signs_videos` are the **reference clips for the avatar/landmark database and the baseline evaluation**, *not* the model's training set. Confirm this characterization. |

## C. Results & evaluation (figures/tables to replace)

| # | Item | Severity | Detail |
|---|------|----------|--------|
| C1 | **ASL Top-1 accuracy = 0.624** | REAL ✓ | From `docs/model_baseline_report.json` (250 evaluated clips of 272; 22 unmapped; threshold logit 0.80; avg softmax 0.545). This is genuine and is used as-is. |
| C2 | **Full confusion matrix (Figure 15)** | PLACEHOLDER | The eval run logged only the **top-10 single-count confusions** (e.g. after→arm, all→weus, alligator→clean) and overall accuracy — not a full 250×250 matrix. Figure 15 is illustrative, seeded with the real pairs. Re-run the evaluation exporting the full matrix to replace it. |
| C3 | **Training/validation curves (Figure 16)** | PLACEHOLDER | No training history/logs are committed. Replace with the real accuracy/loss curves from your training runs. |
| C4 | **Per-class precision/recall (Figure 17)** | PLACEHOLDER | Not exported by the eval run (only overall Top-1 and `thankyou`=1.00, support 2, are real). Replace with real per-class metrics. |
| C5 | **Arabic (ArSL) model accuracy** | GAP | There is **no evaluation report for the 20-class Arabic model** — only the ASL model was benchmarked. Run an equivalent evaluation and report ArSL accuracy/precision/recall. |
| C6 | **Latency numbers (Figure 18)** | REAL ✓ | fp32 7.48 ms → INT8 4.21 ms (1.78×) and gloss cache cold 50.13 ms → warm 0.001 ms are real (`scripts/benchmark.py`, `docs/LATENCY.md`). Used as-is. |
| C7 | **Real-device FPS / end-to-end latency / user study** | GAP | Only synthetic CPU micro-benchmarks exist. If you measured on-device FPS, real network round-trip, or ran any user testing with Deaf/HoH participants, add those results; otherwise this is acknowledged as future work. |

## D. Motivation & background (citations to verify)

| # | Item | Severity | Detail |
|---|------|----------|--------|
| D1 | **Deaf/HoH population statistics** | VERIFY | The motivation cites WHO-style figures on hearing loss and the communication gap. Replace `⚠️ VERIFY` markers with figures you can cite (e.g. WHO World Report on Hearing; Egyptian/MENA Deaf-community statistics). |
| D2 | **Personal/contextual motivation** | GAP | Any project-specific motivation (a sponsor, a community partner, a specific accessibility problem you observed) is known only to you — add 1–2 sentences in §1.1 if desired. |
| D3 | **Reference bibliographic details** | VERIFY | The IEEE reference list cites real, well-known works (MediaPipe, PopSign/GISLR, Sentence-BERT/MiniLM, Transformer, SLR surveys, ArSL papers). Confirm each entry's exact authors/venue/year against the primary source; any you cannot verify are marked `⚠️ VERIFY`. |

## E. Project management

| # | Item | Severity | Detail |
|---|------|----------|--------|
| E1 | **Project timeline / Gantt dates** | VERIFY | Git history in this checkout spans only the final week (the repo appears to have been re-initialized), while the baseline report is dated 2026-04-20. The timeline table in §3.1 is a **representative** schedule for the 2025–2026 academic year — replace milestone dates with your real ones. |
| E2 | **Team member roles / contributions** | GAP | If the faculty requires a per-author contribution statement, supply who did what (recognition models, backend, frontend, datasets, evaluation). |

---

## Quick checklist before submission
- [ ] Fill all `⚠️ GAP` hyperparameter and dataset cells (B2–B4).
- [ ] Replace Figures 15, 16, 17 with real exported artifacts (C2–C4).
- [ ] Add an ArSL evaluation table (C5).
- [ ] Verify every `⚠️ VERIFY` citation/statistic (B1, D1, D3, E1).
- [ ] Confirm department/degree wording and supervisor list (A1–A2).
- [ ] Right-click → **Update Field** on the Table of Contents, List of Figures, and List of Tables in Word to populate page numbers.
