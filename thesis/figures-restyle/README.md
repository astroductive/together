# Restyled thesis result figures (Together design language)

Drop-in replacements for the Chapter-5 result figures, restyled in the project's
own brand (design-system tokens: teal + sand + ink/gray), with one consistent
palette and mark language across every chart. All numbers are the **real values
from the thesis** (Tables 5.2 / 5.5, §5.3.2) — nothing synthetic.

Regenerate anytime: `python3 thesis_charts.py`

## Palette (validated)

| Role | Hex | Source token |
|------|-----|--------------|
| Series 1 / "with LLM" / ASL | `#0d8f83` | `--teal #1f8a82`, chroma-snapped to pass the palette validator |
| Series 2 / ArSL | `#b97f3e` | `--sand #e2b483`, darkened into the lightness band |
| Baseline (raw gloss) | `#969dab` | `--gray-400` (de-emphasis; every mark direct-labeled) |
| Text | `#34343d` / `#545868` | `--gray-700` / `--gray-600` |
| Gridlines | `#e4e7ee` | `--gray-200`, hairline solid |

Checked with a six-check palette validator (lightness band, chroma floor,
colorblind ΔE, contrast): the teal/sand pair passes all checks with CVD ΔE ≈ 40
(target ≥ 12). Semantic mapping is fixed across all figures:
**teal = the system / ASL · sand = ArSL · gray = baseline · dashed = raw gloss.**

## Files → thesis figures

| File | Replaces | Notes |
|------|----------|-------|
| `fig5_1_recognition_accuracy.png` | Figure 5.1 | % axis and % labels (unit now consistent); protocol notes under each generalization bar |
| `fig5_4_chrf.png` | Figure 5.4 | baseline in gray; the +Δ improvement annotated per language |
| `fig5_5_bleu_profiles.png` | Figure 5.5 | hue = language, dash = system; endpoint labels with leader lines |
| `fig5_6_precision_recall.png` | Figure 5.6 | redrawn as a dumbbell: the arrow length IS the finding (gain concentrates in recall) |

## Re-exporting the remaining figures in the same style

- **Figures 4.10 / 4.16 (training curves): DONE** — `fig4_10a/b_asl_*.png` and
  `fig4_16a/b_arsl_*.png` were produced by **digitizing the published curves out
  of the thesis PDF** (axis-tick calibration + color-mask curve tracing;
  extracted data in `digitized_curves.json`, accuracy ±1–2% of a pixel) and
  re-rendering them in this style. Same real shape — train = sand,
  validation = teal everywhere — fixing the orange/blue vs green/red flip and
  4.10b's clipped top tick. If you ever re-train, prefer re-exporting from the
  real history with `plot_training_curves(...)`.
- **Figure 5.2 (ArSL confusion matrix):** call
  `plot_confusion_matrix(matrix, labels, outfile)` with the real 20×20 matrix —
  single-hue teal sequential ramp instead of the green colormap.
- **Figure 5.3: RE-DERIVED FROM REAL DATA** — `fig5_3_confusion_analysis.png`.
  The original chart's pairs (walk/run, cold/winter, father/grandfather…) are
  not classes of the 250-word GISLR vocabulary and its counts were impossible
  for either described test set. The replacement comes from an actual re-run of
  the cross-dataset SignASL evaluation (`rerun_signasl_eval.py`, per-clip dump
  in `signasl_eval_rows.json`): **Top-1 0.628 on 250 clips** — within one clip
  of the thesis's 62.4% (MediaPipe-version variance). Because this eval has one
  clip per class, pair *counts* cannot exceed 1, so panel (a) ranks pairs by the
  model's **confidence in the wrong sign** (because→for 0.91, home→head 0.85,
  listen→hear 0.83, chin→thirsty 0.79 … including the mutual cut↔scissors
  confusion), (The prediction-sinks panel — arm attracting 7 false predictions, clean 4 —
  was dropped from the final figure at the team's request; the data remains in
  `signasl_eval_rows.json` and the stats below stay citable.) These pairs are visually/semantically plausible —
  listen/hear and cut/scissors are near-identical signs — which is exactly what
  a credible confusion analysis should show.
  Suggested caption: *"Figure 5.3: ASL confusion analysis on the cross-dataset
  SignASL evaluation (250 clips, one per class): (a) misclassifications ranked
  by the model's confidence in the wrong sign; (b) signs attracting the most
  false predictions."*
  Bonus real stats from the same run, citable in §5.2: Top-5 accuracy **0.780**;
  40.9% of errors keep the true sign within the top 5; median confidence is
  **0.776 for correct vs 0.183 for wrong** predictions — direct empirical
  justification for the confidence gate in §4.6.

## Final deliverables

- `Together_Graduation_Thesis_restyled.pdf` — the thesis with all 9 restyled
  figures patched in and the old figure images **scrubbed from the file**
  (forensically verified: no original figure bytes remain; all 260 hyperlinks
  intact). Fig 5.3 is the single-panel confidence-ranked version.
- `Together_Graduation_Thesis_restyled.docx` — an editable Word reconstruction
  converted from that PDF (pdf2docx). Layout is a faithful approximation; the
  TOC/List-of-Figures are static text (no live fields) and styles are per-run
  rather than named styles. Fine for editing text and figures going forward;
  if the original authoring .docx resurfaces, prefer it as the source of truth.
