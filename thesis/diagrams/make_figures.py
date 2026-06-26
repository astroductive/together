"""
Generates the matplotlib-based figures for the Together thesis:
  F5  - Model architecture (ASL TFLite I/O contract + Arabic CNN-GRU layer stack)
  F6  - Training / data pipeline (two-lane swimlane)
  F15 - Confusion matrix (PLACEHOLDER, seeded with the REAL top-confusion pairs)
  F16 - Training vs validation accuracy & loss curves (PLACEHOLDER - no logs in repo)
  F17 - Per-class precision / recall (PLACEHOLDER - not exported by eval run)
  F18 - Real measured results: ASL accuracy + latency optimizations (benchmark.py)

Only F18 and the accuracy annotation are grounded in real repo artifacts
(docs/model_baseline_report.json, docs/LATENCY.md, scripts/benchmark.py).
F15/F16/F17 are explicitly marked as placeholders in-figure.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT = os.path.dirname(os.path.abspath(__file__))
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "figure.dpi": 150,
})

BLUE = "#eaf2fb"; BLUE_E = "#2f6db5"
PURP = "#f3eafc"; PURP_E = "#7d4fb5"
GREEN = "#eafbf1"; GREEN_E = "#2f9e5b"
GREY = "#eef1f4"; GREY_E = "#5b6b7d"
AMBER = "#fff4e0"; AMBER_E = "#cc8a00"


def box(ax, x, y, w, h, text, fc, ec, fs=10, weight="normal"):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                       linewidth=1.4, edgecolor=ec, facecolor=fc, mutation_aspect=1)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fs, fontweight=weight, color="#11233a", wrap=True)


def arrow(ax, x1, y1, x2, y2, color="#5b6b7d"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                 mutation_scale=14, linewidth=1.4, color=color))


# ───────────────────────── F5 model architecture ─────────────────────────
def fig_f5():
    fig, (axL, axR) = plt.subplots(1, 2, figsize=(11, 7.6))
    for ax in (axL, axR):
        ax.set_xlim(0, 10); ax.set_ylim(0, 16); ax.axis("off")

    # Left: ASL TFLite (I/O contract; internals not introspectable)
    axL.set_title("(a) English ASL recognizer — TFLite (GISLR-style, 250 classes)", fontsize=11.5)
    layers_L = [
        ("Input sequence\n(N, 543, 3)  float32\nMediaPipe Holistic landmarks\nface 468 + L-hand 21 + pose 33 + R-hand 21\nmissing point = NaN (masked)", BLUE, BLUE_E, 2.6),
        ("TFLite graph  (model.tflite, ~11 MB)\nLiteRT interpreter + XNNPACK delegate\nvariable-length, internal masking\n[architecture not introspectable\nfrom the exported .tflite]", GREY, GREY_E, 2.6),
        ("Output logits  (250,)\nraw scores (sum ≈ −55)", PURP, PURP_E, 1.5),
        ("Softmax + argmax\nconfidence gate (> 0.50)", GREEN, GREEN_E, 1.5),
        ("Predicted sign  ∈ 250-word vocab\n(TV … zipper)", BLUE, BLUE_E, 1.4),
    ]
    y = 14.4
    cx = 5
    prev = None
    for txt, fc, ec, h in layers_L:
        box(axL, 1.0, y - h, 8.0, h, txt, fc, ec, fs=9.0)
        if prev is not None:
            arrow(axL, cx, prev, cx, y)
        prev = y - h
        y -= h + 0.55

    # Right: Arabic CNN-GRU (full layer stack with shapes)
    axR.set_title("(b) Arabic ArSL recognizer — CNN-GRU (20 classes)", fontsize=11.5)
    layers_R = [
        ("Input sequence  (B, 30, 177)\n17 pose + 21 L-hand + 21 R-hand  (×3, Z=0)\nshoulder-normalized; hand interpolation", BLUE, BLUE_E, 1.7),
        ("permute → Conv1d(177→128, k=3, p=1)\nBatchNorm1d + ReLU", PURP, PURP_E, 1.25),
        ("Conv1d(128→128, k=3, p=1)\nBatchNorm1d + ReLU", PURP, PURP_E, 1.25),
        ("Bi-GRU(128→64), 2 layers\ndropout 0.3  → (B, 30, 128)", GREEN, GREEN_E, 1.25),
        ("take last timestep → (B, 128)", GREY, GREY_E, 0.95),
        ("Linear(128→64) + ReLU + Dropout(0.5)", PURP, PURP_E, 1.0),
        ("Linear(64→20) → logits", PURP, PURP_E, 0.95),
        ("mean-ensemble over windows 30/45/60\nsoftmax · gate > 0.45", GREEN, GREEN_E, 1.25),
        ("Predicted sign ∈ 20-word vocab\nINT8-quantized · 4.21 ms / inference (CPU)", BLUE, BLUE_E, 1.25),
    ]
    y = 15.4
    cx = 5
    prev = None
    for txt, fc, ec, h in layers_R:
        box(axR, 0.6, y - h, 8.8, h, txt, fc, ec, fs=8.6)
        if prev is not None:
            arrow(axR, cx, prev, cx, y)
        prev = y - h
        y -= h + 0.32

    fig.suptitle("Figure 5: Recognition model architectures (derived from models/sign_predictor.py and the TFLite I/O signature)",
                 fontsize=10.5, y=0.995, color="#11233a")
    fig.tight_layout(rect=[0, 0, 1, 0.97])
    fig.savefig(os.path.join(OUT, "F5_model_arch.png"), bbox_inches="tight")
    plt.close(fig)


# ───────────────────────── F6 training pipeline ─────────────────────────
def fig_f6():
    fig, ax = plt.subplots(figsize=(12, 5.2))
    ax.set_xlim(0, 14); ax.set_ylim(0, 6); ax.axis("off")

    lanes = [
        ("English ASL — 250 classes (TFLite, GISLR-style)", 4.0, BLUE, BLUE_E,
         ["Isolated-sign\nclip corpus", "MediaPipe\nlandmark extract", "Normalize +\nNaN missing",
          "Train / validate\n(off-repo)", "Export\nmodel.tflite", "Baseline eval\n250 clips", "Top-1 = 0.624"]),
        ("Arabic ArSL — 20 classes (CNN-GRU)", 1.2, GREEN, GREEN_E,
         ["Egyptian ArSL\nword videos", "MediaPipe\n177-d / frame", "Window 30/45/60\n→ sample 30",
          "Train CNN-GRU\n(off-repo)", "best_model.pth", "INT8 dynamic\nquantization"]),
    ]
    for title, ly, fc, ec, steps in lanes:
        ax.text(0.1, ly + 1.15, title, fontsize=11, fontweight="bold", color=ec)
        n = len(steps)
        w = 1.62; gap = (14 - 0.2 - n * w) / (n - 1)
        x = 0.1
        prev = None
        for s in steps:
            box(ax, x, ly, w, 0.95, s, fc, ec, fs=8.2)
            if prev is not None:
                arrow(ax, prev, ly + 0.475, x, ly + 0.475)
            prev = x + w
            x += w + gap
    ax.text(7, 5.75, "Figure 6: Per-language training & data pipeline (training performed off-repo; only the trained checkpoints and the baseline evaluation are in the repository)",
            ha="center", fontsize=9.5, color="#11233a")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "F6_training.png"), bbox_inches="tight")
    plt.close(fig)


# ───────────────────────── F15 confusion matrix (placeholder) ─────────────
def fig_f15():
    # Seeded with the REAL top-confusion pairs from docs/model_baseline_report.json.
    labels = ["after", "arm", "all", "weus", "alligator", "clean",
              "open", "backyard", "up", "because", "for", "before", "have"]
    real_conf = [("after", "arm"), ("all", "weus"), ("alligator", "clean"),
                 ("arm", "open"), ("backyard", "up"), ("because", "for"),
                 ("before", "have")]
    n = len(labels)
    idx = {l: i for i, l in enumerate(labels)}
    M = np.zeros((n, n))
    rng = np.random.default_rng(7)
    # diagonal dominance ~ 0.62 (matches overall Top-1) with small noise
    for i in range(n):
        M[i, i] = rng.integers(5, 9)
    for t, p in real_conf:
        M[idx[t], idx[p]] += 2  # the documented confusions
    # a little symmetric noise
    for _ in range(10):
        i, j = rng.integers(0, n, 2)
        if i != j:
            M[i, j] += rng.integers(0, 2)

    fig, ax = plt.subplots(figsize=(8.2, 7.2))
    im = ax.imshow(M, cmap="Blues")
    ax.set_xticks(range(n)); ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=9)
    ax.set_yticks(range(n)); ax.set_yticklabels(labels, fontsize=9)
    ax.set_xlabel("Predicted sign"); ax.set_ylabel("True sign")
    for i in range(n):
        for j in range(n):
            if M[i, j] > 0:
                ax.text(j, i, int(M[i, j]), ha="center", va="center",
                        fontsize=8, color="#11233a" if M[i, j] < 6 else "white")
    ax.set_title("Figure 15: ASL confusion matrix (illustrative subset)", fontsize=12)
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="count")
    fig.text(0.5, 0.005,
             "⚠ PLACEHOLDER — seeded with the real top-confusion pairs from the baseline run "
             "(e.g. after→arm, all→weus, alligator→clean). The full 250×250 matrix was not exported; "
             "replace with the complete matrix when available.",
             ha="center", fontsize=8.0, color="#9a2b00", wrap=True)
    fig.tight_layout(rect=[0, 0.04, 1, 1])
    fig.savefig(os.path.join(OUT, "F15_confusion_matrix.png"), bbox_inches="tight")
    plt.close(fig)


# ───────────────────────── F16 training curves (placeholder) ──────────────
def fig_f16():
    epochs = np.arange(1, 31)
    rng = np.random.default_rng(3)
    tr_acc = 0.95 * (1 - np.exp(-epochs / 6)) + rng.normal(0, 0.01, 30)
    va_acc = 0.80 * (1 - np.exp(-epochs / 7)) + rng.normal(0, 0.015, 30)
    tr_loss = 2.6 * np.exp(-epochs / 7) + 0.15 + rng.normal(0, 0.02, 30)
    va_loss = 2.6 * np.exp(-epochs / 8) + 0.55 + rng.normal(0, 0.03, 30)

    fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.4))
    a1.plot(epochs, tr_acc, "-o", ms=3, color=BLUE_E, label="train")
    a1.plot(epochs, va_acc, "-s", ms=3, color=PURP_E, label="validation")
    a1.set_title("Accuracy"); a1.set_xlabel("epoch"); a1.set_ylabel("accuracy")
    a1.set_ylim(0, 1); a1.legend(); a1.grid(alpha=0.3)
    a2.plot(epochs, tr_loss, "-o", ms=3, color=BLUE_E, label="train")
    a2.plot(epochs, va_loss, "-s", ms=3, color=PURP_E, label="validation")
    a2.set_title("Loss"); a2.set_xlabel("epoch"); a2.set_ylabel("cross-entropy")
    a2.legend(); a2.grid(alpha=0.3)
    fig.suptitle("Figure 16: Training vs validation accuracy and loss", fontsize=12, fontweight="bold")
    fig.text(0.5, 0.005,
             "⚠ PLACEHOLDER — illustrative curves. No training logs/history are committed to the repository "
             "(the models ship as trained checkpoints). Replace with the real curves from the training run.",
             ha="center", fontsize=8.2, color="#9a2b00", wrap=True)
    fig.tight_layout(rect=[0, 0.05, 1, 0.95])
    fig.savefig(os.path.join(OUT, "F16_training_curves.png"), bbox_inches="tight")
    plt.close(fig)


# ───────────────────────── F17 per-class P/R (placeholder) ────────────────
def fig_f17():
    classes = ["thankyou", "happy", "mother", "eat", "love", "house", "stop",
               "after", "arm", "all", "alligator", "backyard"]
    rng = np.random.default_rng(11)
    prec = np.clip(rng.normal(0.63, 0.18, len(classes)), 0.2, 1.0)
    rec = np.clip(rng.normal(0.62, 0.18, len(classes)), 0.2, 1.0)
    prec[0] = rec[0] = 1.0  # 'thankyou' was 1.0 in the real report (support=2)
    x = np.arange(len(classes)); w = 0.4
    fig, ax = plt.subplots(figsize=(11, 4.6))
    ax.bar(x - w / 2, prec, w, color=BLUE_E, label="precision")
    ax.bar(x + w / 2, rec, w, color=GREEN_E, label="recall")
    ax.axhline(0.624, ls="--", color=AMBER_E, lw=1.5, label="overall Top-1 = 0.624 (real)")
    ax.set_xticks(x); ax.set_xticklabels(classes, rotation=40, ha="right")
    ax.set_ylim(0, 1.05); ax.set_ylabel("score"); ax.legend(ncol=3, fontsize=9)
    ax.set_title("Figure 17: Per-class precision / recall (ASL)", fontsize=12)
    fig.text(0.5, 0.005,
             "⚠ PLACEHOLDER — per-class precision/recall was not exported by the evaluation run "
             "(only overall Top-1 = 0.624 and 'thankyou' = 1.00, support 2, are real). Replace with real per-class metrics.",
             ha="center", fontsize=8.2, color="#9a2b00", wrap=True)
    fig.tight_layout(rect=[0, 0.05, 1, 1])
    fig.savefig(os.path.join(OUT, "F17_per_class.png"), bbox_inches="tight")
    plt.close(fig)


# ───────────────────────── F18 real measured results ─────────────────────
def fig_f18():
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.4))

    # (a) Arabic predictor latency: fp32 vs int8 (REAL, docs/LATENCY.md, benchmark.py)
    a1.bar(["fp32\n(inference_mode)", "INT8\ndynamic"], [7.48, 4.21],
           color=[GREY_E, GREEN_E], width=0.55)
    for i, v in enumerate([7.48, 4.21]):
        a1.text(i, v + 0.15, f"{v} ms", ha="center", fontsize=10, fontweight="bold")
    a1.set_ylabel("ms / inference (CPU)")
    a1.set_title("Arabic CNN-GRU latency\n(50 runs, [60,543,3]) — 1.78× faster")
    a1.set_ylim(0, 9); a1.grid(axis="y", alpha=0.3)

    # (b) gloss-to-sentence cache cold vs warm (REAL) + ASL accuracy annotation
    a2.bar(["cold\n(LLM 50 ms sim)", "warm\n(cache hit)"], [50.13, 0.001],
           color=[GREY_E, BLUE_E], width=0.55)
    a2.set_yscale("log")
    a2.text(0, 60, "50.13 ms", ha="center", fontsize=10, fontweight="bold")
    a2.text(1, 0.0014, "0.001 ms", ha="center", fontsize=10, fontweight="bold")
    a2.set_ylabel("ms (log scale)")
    a2.set_title("Gloss→sentence cache\ncold vs warm")
    a2.grid(axis="y", alpha=0.3)

    fig.suptitle("Figure 18: Real measured optimizations (scripts/benchmark.py, docs/LATENCY.md)  ·  "
                 "ASL recognizer Top-1 = 0.624 on 250 clips",
                 fontsize=10.5, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(os.path.join(OUT, "F18_results_real.png"), bbox_inches="tight")
    plt.close(fig)


for fn in (fig_f5, fig_f6, fig_f15, fig_f16, fig_f17, fig_f18):
    fn()
    print("done", fn.__name__)
print("ALL FIGURES GENERATED")
