# Build Report — Together Graduation Thesis

**Generated deliverables (in `./thesis/`):**

| File | What it is |
|------|------------|
| `Together_Graduation_Thesis.docx` | The complete FUE-format thesis (front matter + Chapters 1–4 + References). 18 figures, 12 tables, updatable TOC / List of Figures / List of Tables fields, IEEE in-text citations hyperlinked to the reference list, roman→decimal page numbering. |
| `diagrams/` | 18 figures, each as **source** (`.mmd` for 12 Mermaid diagrams, `make_figures.py` for 6 matplotlib figures) **and** rendered `.png`. |
| `REPO_INVENTORY.md` | Every significant file/folder → one-line purpose. |
| `GAPS_AND_QUESTIONS.md` | Everything missing that only you can supply, grouped by severity. |
| `build_thesis.py`, `thesis_content.py` | Reproducible docx builder (run `python3 build_thesis.py`). |

**Validation performed:** the docx was re-opened with python-docx (well-formed OOXML); all
19 embedded images fit within the text width (max 6.2″ ≤ 6.5″); TOC + 2 Table-of-Figures
fields + 18 `SEQ Figure` + 12 `SEQ Table` + PAGE fields (both footers) are present; all 20
references are cited and every in-text `[n]` resolves to its bookmark; page numbering is
lower-roman (front matter) then decimal (body). *Note:* LibreOffice PDF conversion is
non-functional in this build environment, so a PDF preview could not be produced; open the
docx in Microsoft Word and **right-click → Update Field** on the three lists to populate
page numbers.

---

## What real data backed each results figure/table

| Artifact | Source | Real or placeholder |
|----------|--------|---------------------|
| ASL Top-1 = **0.624** (Table 12, Fig. 18 note) | `docs/model_baseline_report.json` (250 of 272 clips, threshold logit 0.80, avg softmax 0.545) | **REAL** |
| Latency fp32 **7.48 ms** → INT8 **4.21 ms** (Fig. 18) | `scripts/benchmark.py`, `docs/LATENCY.md` | **REAL** |
| Gloss cache cold **50 ms** → warm **~0.001 ms** (Fig. 18) | `scripts/benchmark.py`, `docs/LATENCY.md` | **REAL** |
| Model architectures (Fig. 5) | `models/sign_predictor.py` + TFLite I/O signature | **REAL** (code-derived) |
| Vocabularies / data sources (Table 8) | label maps + `asl_service.py` + `build_*_db.py` | **REAL** (provenance flagged VERIFY/GAP) |
| Software stack versions (Table 6) | `requirements.txt`, frontend includes | **REAL** |
| Functional test outcomes (Table 11) | committed `tests/` suite (CI runs auth + templates) | **REAL** (suite-attributed; re-run to confirm ML modules) |
| Confusion matrix (Fig. 15) | seeded with the real top-confusion pairs, full matrix synthetic | **PLACEHOLDER** |
| Training/validation curves (Fig. 16) | no training logs in repo | **PLACEHOLDER** |
| Per-class precision/recall (Fig. 17) | not exported by eval run (`thankyou`=1.0 is the only real per-class point) | **PLACEHOLDER** |

## ⚠ Items to fix before submission (see GAPS_AND_QUESTIONS.md for full detail)

**GAP (data the repo does not contain):**
- Training hyperparameters for both models (epochs, optimizer, LR, batch, loss, augmentation).
- ArSL dataset source, #signers, consent, demographics; train/val/test splits for both models.
- A full confusion matrix, per-class precision/recall, and an **ArSL accuracy** evaluation.
- Real-device FPS / end-to-end latency / any user study.
- Project-specific motivation; per-author contribution statement (if required).

**PLACEHOLDER (figures to replace with real artifacts):** Figures 15, 16, 17.

**VERIFY (confirm before submission):**
- ASL dataset = GISLR/PopSign — confirm exact dataset, version, licence, and whether your
  team trained `model.tflite` or adapted a public checkpoint.
- Motivation statistics (WHO / Egypt-MENA Deaf population) — cite verifiable sources.
- Reference [4] (GISLR/Kaggle) and [20] (WHO) bibliographic details.
- Project timeline dates in Table 2 (git history covers only the final week).
- Department/degree wording and supervisor list (one supervisor provided; second row left
  as a visible placeholder).

**Visible placeholders inserted in the document:** `[SECOND SUPERVISOR — if any]`, `[DATE]`
(declaration signatures), and inline bold-red `⚠ GAP/VERIFY/PLACEHOLDER` markers throughout.
