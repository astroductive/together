# -*- coding: utf-8 -*-
"""
Restyled result figures for the Together thesis (Figures 5.1, 5.4, 5.5, 5.6)
in the project's own design language (Together design-system tokens).

Palette (validated with the six-check palette validator, light surface):
  TEAL  #0d8f83  — brand teal, chroma-snapped from --teal #1f8a82
  SAND  #b97f3e  — brand sand,  darkened from --sand #e2b483
  Baseline series wear neutral gray (de-emphasis); every mark is direct-labeled
  and each figure sits next to its data table in the thesis (relief channel).

All values are the REAL numbers from the thesis (Tables 5.2, 5.5 and §5.3.2).
Usage:  python3 thesis_charts.py   → writes fig5_1.png … fig5_6.png (300 dpi)

`apply_thesis_style()` + `plot_training_curves()` at the bottom are for the
team's notebooks, to re-export Figures 4.10 / 4.16 from the real Keras/PyTorch
history in the same style.
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Together design tokens ────────────────────────────────────────────────
TEAL = "#0d8f83"       # series 1 / "with LLM" / primary
SAND = "#b97f3e"       # series 2 / ArSL where hue = language
GRAY_BASE = "#969dab"  # baseline series (de-emphasis; always direct-labeled)
INK = "#34343d"        # primary text   (--gray-700)
MUTED = "#545868"      # secondary text (--gray-600)
GRID = "#e4e7ee"       # hairline grid  (--gray-200)
SURFACE = "#ffffff"

BAR_ROUND_PX = 4       # rounded data-end
LINE_W = 2.0


def apply_thesis_style():
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "font.size": 10,
        "text.color": INK,
        "axes.edgecolor": GRID,
        "axes.labelcolor": MUTED,
        "axes.linewidth": 0.8,
        "axes.grid": True,
        "axes.axisbelow": True,
        "grid.color": GRID,
        "grid.linewidth": 0.8,
        "grid.linestyle": "-",
        "xtick.color": MUTED,
        "ytick.color": MUTED,
        "xtick.labelsize": 9.5,
        "ytick.labelsize": 9.5,
        "legend.frameon": False,
        "legend.fontsize": 9.5,
        "figure.dpi": 300,
        "savefig.dpi": 300,
        "savefig.facecolor": SURFACE,
        "axes.facecolor": SURFACE,
    })


def _despine(ax, keep_bottom=True):
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_visible(keep_bottom)
    ax.tick_params(length=0)
    ax.yaxis.grid(True)
    ax.xaxis.grid(False)


def rounded_bar(ax, x, height, width, color, round_frac=0.06):
    """Bar with a rounded data-end and a square baseline (spec: 4px top radius)."""
    r = min(round_frac * (ax.get_ylim()[1] - ax.get_ylim()[0]), height * 0.4)
    rw = min(width * 0.35, width / 2)
    x0, x1 = x - width / 2, x + width / 2
    verts = [
        (x0, 0), (x0, height - r),
        (x0, height), (x0 + rw, height),            # top-left corner curve
        (x1 - rw, height), (x1, height),
        (x1, height - r),                            # top-right corner curve
        (x1, 0), (x0, 0),
    ]
    codes = [Path.MOVETO, Path.LINETO,
             Path.CURVE3, Path.CURVE3,
             Path.LINETO, Path.CURVE3,
             Path.CURVE3, Path.LINETO, Path.CLOSEPOLY]
    ax.add_patch(PathPatch(Path(verts, codes), facecolor=color,
                           edgecolor="none", zorder=3))


def _tip_label(ax, x, y, text, dy):
    ax.text(x, y + dy, text, ha="center", va="bottom",
            fontsize=9.5, fontweight="bold", color=INK, zorder=4)


# ══════════════════════════════════════════════════════════════════════════
# Figure 5.1 — Recognition accuracy: in-distribution vs generalization
#   (real values: Table 5.2)
# ══════════════════════════════════════════════════════════════════════════
def fig5_1():
    apply_thesis_style()
    fig, ax = plt.subplots(figsize=(6.4, 3.3))
    groups = ["ASL (250-class)", "ArSL (20-class)"]
    indist = [80.0, 99.41]
    gener = [62.4, 88.0]
    gen_note = ["cross-dataset (SignASL)", "signer-independent"]

    xg = np.array([0, 1.0])
    w, gap = 0.16, 0.02                      # slim bars + 2px-equivalent gap
    ax.set_ylim(0, 112)
    for i in range(2):
        rounded_bar(ax, xg[i] - (w + gap) / 2, indist[i], w, TEAL)
        rounded_bar(ax, xg[i] + (w + gap) / 2, gener[i], w, SAND)
        _tip_label(ax, xg[i] - (w + gap) / 2, indist[i], f"{indist[i]:.4g}%", 2)
        _tip_label(ax, xg[i] + (w + gap) / 2, gener[i], f"{gener[i]:.4g}%", 2)
        ax.text(xg[i] + (w + gap) / 2, -14, gen_note[i], ha="center",
                fontsize=8, color=MUTED, style="italic")

    ax.set_xticks(xg); ax.set_xticklabels(groups, fontsize=10.5, color=INK)
    ax.set_yticks([0, 25, 50, 75, 100])
    ax.set_yticklabels(["0%", "25%", "50%", "75%", "100%"])
    ax.set_ylabel("Top-1 accuracy")
    ax.set_xlim(-0.45, 1.45)
    _despine(ax)
    ax.legend(handles=[plt.Rectangle((0, 0), 1, 1, fc=TEAL),
                       plt.Rectangle((0, 0), 1, 1, fc=SAND)],
              labels=["In-distribution test", "Generalization test"],
              loc="upper left", bbox_to_anchor=(0.0, 1.02), ncol=1,
              handlelength=1.1, handleheight=1.1)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig5_1_recognition_accuracy.png"),
                bbox_inches="tight")
    plt.close(fig)


# ══════════════════════════════════════════════════════════════════════════
# Figure 5.4 — Translation quality (chrF): LLM vs raw gloss
#   (real values: Table 5.5)
# ══════════════════════════════════════════════════════════════════════════
def fig5_4():
    apply_thesis_style()
    fig, ax = plt.subplots(figsize=(6.4, 3.2))
    llm = [0.911, 0.593]
    raw = [0.543, 0.344]
    xg = np.array([0, 1.0])
    w, gap = 0.16, 0.02
    ax.set_ylim(0, 1.09)
    for i in range(2):
        rounded_bar(ax, xg[i] - (w + gap) / 2, llm[i], w, TEAL)
        rounded_bar(ax, xg[i] + (w + gap) / 2, raw[i], w, GRAY_BASE)
        _tip_label(ax, xg[i] - (w + gap) / 2, llm[i], f"{llm[i]:.2f}", 0.02)
        _tip_label(ax, xg[i] + (w + gap) / 2, raw[i], f"{raw[i]:.2f}", 0.02)
        # improvement annotation between the pair
        ax.annotate(f"+{llm[i]-raw[i]:.2f}",
                    xy=(xg[i], max(llm[i], raw[i]) + 0.115),
                    ha="center", fontsize=9, color=TEAL, fontweight="bold")
    ax.set_xticks(xg)
    ax.set_xticklabels(["ASL (English)", "ArSL (Arabic)"], fontsize=10.5, color=INK)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.set_ylabel("chrF")
    ax.set_xlim(-0.45, 1.45)
    _despine(ax)
    ax.legend(handles=[plt.Rectangle((0, 0), 1, 1, fc=TEAL),
                       plt.Rectangle((0, 0), 1, 1, fc=GRAY_BASE)],
              labels=["With LLM (Gemini)", "Raw gloss (baseline)"],
              loc="upper right", handlelength=1.1, handleheight=1.1)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig5_4_chrf.png"), bbox_inches="tight")
    plt.close(fig)


# ══════════════════════════════════════════════════════════════════════════
# Figure 5.5 — Cumulative BLEU-n profiles
#   hue = language (teal ASL / sand ArSL); dash = system (solid LLM / dashed raw)
#   (real values: Table 5.5)
# ══════════════════════════════════════════════════════════════════════════
def fig5_5():
    apply_thesis_style()
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    x = np.arange(4)
    series = [
        ("ASL — with LLM",  [0.945, 0.905, 0.855, 0.805], TEAL, "-",  "o"),
        ("ASL — raw gloss", [0.451, 0.221, 0.091, 0.040], TEAL, "--", "o"),
        ("ArSL — with LLM", [0.527, 0.444, 0.424, 0.419], SAND, "-",  "s"),
        ("ArSL — raw gloss",[0.211, 0.061, 0.024, 0.026], SAND, "--", "s"),
    ]
    # endpoint labels: the two raw-gloss series converge at BLEU-4, so their
    # labels are dodged apart with thin leader lines instead of stacking.
    label_dy = {0: 0.0, 1: +0.08, 2: 0.0, 3: 0.0}
    for si, (name, ys, color, ls, mk) in enumerate(series):
        filled = (ls == "-")
        ax.plot(x, ys, ls, color=color, lw=LINE_W, solid_capstyle="round",
                zorder=3, dash_capstyle="round")
        ax.scatter(x, ys, s=42, zorder=4,
                   facecolor=color if filled else SURFACE,
                   edgecolor=color, linewidth=1.6)
        # white surface ring so markers survive line crossings
        ax.scatter(x, ys, s=90, zorder=2, facecolor=SURFACE, edgecolor="none")
        dy = label_dy[si]
        ly = ys[-1] + dy
        if dy:
            ax.plot([x[-1] + 0.04, x[-1] + 0.10], [ys[-1], ly],
                    color=GRAY_BASE, lw=0.7, zorder=2)
        ax.text(x[-1] + 0.12, ly, f"{ys[-1]:.2f}", va="center",
                fontsize=9, color=INK,
                fontweight="bold" if filled else "normal")
    ax.set_xticks(x)
    ax.set_xticklabels(["BLEU-1", "BLEU-2", "BLEU-3", "BLEU-4"],
                       fontsize=10, color=INK)
    ax.set_ylim(0, 1.02); ax.set_xlim(-0.2, 3.55)
    ax.set_ylabel("Cumulative BLEU-n")
    _despine(ax)
    handles = [plt.Line2D([], [], color=c, ls=ls, lw=LINE_W, marker=mk,
                          markerfacecolor=(c if ls == "-" else SURFACE),
                          markeredgecolor=c, markersize=6)
               for _, _, c, ls, mk in series]
    ax.legend(handles=handles, labels=[s[0] for s in series],
              loc="upper right", ncol=2, columnspacing=1.2)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig5_5_bleu_profiles.png"), bbox_inches="tight")
    plt.close(fig)


# ══════════════════════════════════════════════════════════════════════════
# Figure 5.6 — chrF precision vs recall, raw → LLM  (dumbbell form:
#   the arrow length IS the finding — the LLM's gain concentrates in recall)
#   (real values: §5.3.2 / Figure 5.6 of the thesis)
# ══════════════════════════════════════════════════════════════════════════
def fig5_6():
    apply_thesis_style()
    fig, ax = plt.subplots(figsize=(6.4, 3.4))
    rows = [  # label, raw, llm, hue
        ("ASL — precision",  0.71, 0.93, TEAL),
        ("ASL — recall",     0.52, 0.91, TEAL),
        ("ArSL — precision", 0.54, 0.64, SAND),
        ("ArSL — recall",    0.32, 0.59, SAND),
    ]
    y = np.arange(len(rows))[::-1]
    for (label, raw, llm, hue), yy in zip(rows, y):
        ax.plot([raw, llm], [yy, yy], color=GRID, lw=3, zorder=2,
                solid_capstyle="round")
        ax.annotate("", xy=(llm, yy), xytext=(raw, yy),
                    arrowprops=dict(arrowstyle="-|>", color=hue, lw=2,
                                    shrinkA=6, shrinkB=4), zorder=3)
        ax.scatter([raw], [yy], s=58, facecolor=SURFACE, edgecolor=GRAY_BASE,
                   linewidth=1.8, zorder=4)
        ax.scatter([llm], [yy], s=64, facecolor=hue, edgecolor=SURFACE,
                   linewidth=1.5, zorder=5)
        ax.text(raw - 0.025, yy, f"{raw:.2f}", ha="right", va="center",
                fontsize=9, color=MUTED)
        ax.text(llm + 0.025, yy, f"{llm:.2f}", ha="left", va="center",
                fontsize=9.5, color=INK, fontweight="bold")
    ax.set_yticks(y)
    ax.set_yticklabels([r[0] for r in rows], fontsize=10, color=INK)
    ax.set_xlim(0.18, 1.06); ax.set_ylim(-0.6, len(rows) - 0.4)
    ax.set_xlabel("chrF component")
    _despine(ax, keep_bottom=True)
    ax.xaxis.grid(True); ax.yaxis.grid(False)
    ax.scatter([], [], s=58, facecolor=SURFACE, edgecolor=GRAY_BASE,
               linewidth=1.8, label="Raw gloss")
    ax.scatter([], [], s=64, facecolor=INK, edgecolor=SURFACE,
               label="With LLM")
    ax.legend(loc="lower right", ncol=2)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig5_6_precision_recall.png"),
                bbox_inches="tight")
    plt.close(fig)


# ══════════════════════════════════════════════════════════════════════════
# For the team's notebooks — re-export Figures 4.10 / 4.16 in this style.
# Call with the REAL history arrays (never synthetic data).
# ══════════════════════════════════════════════════════════════════════════
def plot_training_curves(epochs, train, val, ylabel, outfile,
                         final_annotation=None):
    """One panel, train vs validation, thesis style.
    train/validation wear the SAME palette in every figure:
    train = sand, validation = teal (validation is the number the thesis reports).
    """
    apply_thesis_style()
    fig, ax = plt.subplots(figsize=(6.4, 3.2))
    ax.plot(epochs, train, "-", color=SAND, lw=LINE_W, label="train")
    ax.plot(epochs, val, "-", color=TEAL, lw=LINE_W, label="validation")
    if final_annotation:
        ax.axhline(val[-1], color=TEAL, lw=0.8, ls=":", alpha=0.6)
        ax.text(epochs[-1], val[-1], f"  {final_annotation}", va="center",
                fontsize=9.5, color=INK, fontweight="bold")
    ax.set_xlabel("Epoch"); ax.set_ylabel(ylabel)
    _despine(ax)
    ax.legend(loc="best")
    fig.tight_layout()
    fig.savefig(outfile, bbox_inches="tight")
    plt.close(fig)


def plot_confusion_matrix(matrix, labels, outfile, annotate_min=1):
    """Re-export Figure 5.2 (ArSL 20×20 confusion matrix) in the thesis style.
    `matrix` is the REAL confusion matrix (rows = true, cols = predicted).
    Sequential color = one hue (brand teal), white→dark, per the color formula.
    """
    from matplotlib.colors import LinearSegmentedColormap
    apply_thesis_style()
    n = len(labels)
    cmap = LinearSegmentedColormap.from_list("teal_seq", ["#ffffff", TEAL])
    fig, ax = plt.subplots(figsize=(7.6, 6.8))
    im = ax.imshow(matrix, cmap=cmap)
    ax.set_xticks(range(n)); ax.set_yticks(range(n))
    ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=8)
    ax.set_yticklabels(labels, fontsize=8)
    ax.set_xlabel("Predicted label"); ax.set_ylabel("True label")
    ax.grid(False)
    vmax = matrix.max()
    for i in range(n):
        for j in range(n):
            v = matrix[i][j]
            if v >= annotate_min:
                ax.text(j, i, int(v), ha="center", va="center", fontsize=7,
                        color="#ffffff" if v > 0.6 * vmax else INK)
    cb = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.03)
    cb.set_label("Samples", color=MUTED)
    cb.outline.set_visible(False)
    fig.tight_layout()
    fig.savefig(outfile, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    for f in (fig5_1, fig5_4, fig5_5, fig5_6):
        f()
        print("done", f.__name__)
    print("ALL RESTYLED FIGURES WRITTEN to", OUT)
