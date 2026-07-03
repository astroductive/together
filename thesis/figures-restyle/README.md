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

- **Figures 4.10 / 4.16 (training curves):** call
  `plot_training_curves(epochs, train, val, ylabel, outfile, final_annotation="val ≈ 0.80")`
  from your training notebook with the real history arrays. This fixes the
  current inconsistency where 4.10 uses orange/blue and 4.16 green/red for the
  same two series (train = sand, validation = teal, everywhere), and the clipped
  top tick on 4.10b.
- **Figure 5.2 (ArSL confusion matrix):** call
  `plot_confusion_matrix(matrix, labels, outfile)` with the real 20×20 matrix —
  single-hue teal sequential ramp instead of the green colormap.
- **Figure 5.3:** ⚠ see the review note — its sign pairs (walk/run, cold/winter,
  father/grandfather…) are not classes of the 250-word GISLR vocabulary and the
  counts exceed what either described test set could produce. Re-derive this
  chart from the real evaluation output before restyling it.
