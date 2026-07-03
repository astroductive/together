# -*- coding: utf-8 -*-
"""Builds two exhaustive, beginner-level DOCX manuals:
  ASL_Model_Complete_Guide.docx  — training / augmentation / inference of the ASL model
  ArSL_Model_Complete_Guide.docx — training / augmentation / inference of the ArSL model
Every value comes from the thesis. Style: deliberately dry, step-by-step, all
terms defined at first use ("explain like I know nothing about deep learning").
"""
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
INK = RGBColor(0x11, 0x23, 0x3A)
TEAL = RGBColor(0x0D, 0x8F, 0x83)


def new_doc(title, subtitle):
    d = Document()
    st = d.styles["Normal"]
    st.font.name = "Times New Roman"
    st.font.size = Pt(12)
    st.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    st.paragraph_format.space_after = Pt(6)
    for name, sz in [("Heading 1", 20), ("Heading 2", 15), ("Heading 3", 13)]:
        h = d.styles[name]
        h.font.name = "Times New Roman"
        h.font.size = Pt(sz)
        h.font.bold = True
        h.font.color.rgb = INK
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(title)
    r.font.size = Pt(24); r.bold = True; r.font.color.rgb = TEAL
    p2 = d.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run(subtitle)
    r2.font.size = Pt(13); r2.italic = True
    p3 = d.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = p3.add_run("Together — Graduation Project · Internal study document · July 2026")
    r3.font.size = Pt(10); r3.font.color.rgb = RGBColor(0x96, 0x9D, 0xAB)
    return d


def H1(d, t): d.add_heading(t, 1)
def H2(d, t): d.add_heading(t, 2)
def H3(d, t): d.add_heading(t, 3)


def P(d, t):
    para = d.add_paragraph()
    for seg in t.split("**"):
        pass
    # simple **bold** support
    parts = t.split("**")
    for i, seg in enumerate(parts):
        r = para.add_run(seg)
        if i % 2 == 1:
            r.bold = True
    return para


def B(d, t):
    para = d.add_paragraph(style="List Bullet")
    parts = t.split("**")
    for i, seg in enumerate(parts):
        r = para.add_run(seg)
        if i % 2 == 1:
            r.bold = True


def NUM(d, t):
    para = d.add_paragraph(style="List Number")
    parts = t.split("**")
    for i, seg in enumerate(parts):
        r = para.add_run(seg)
        if i % 2 == 1:
            r.bold = True


def TABLE(d, headers, rows, widths=None):
    t = d.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    for i, h in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = ""
        r = cell.paragraphs[0].add_run(h)
        r.bold = True
        r.font.size = Pt(10.5)
        shd = OxmlElement("w:shd"); shd.set(qn("w:val"), "clear")
        shd.set(qn("w:fill"), "E8F3F1")
        cell._tc.get_or_add_tcPr().append(shd)
    for row in rows:
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = ""
            para = cells[i].paragraphs[0]
            para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            parts = str(v).split("**")
            for j, seg in enumerate(parts):
                r = para.add_run(seg)
                r.font.size = Pt(10.5)
                if j % 2 == 1:
                    r.bold = True
    if widths:
        for i, w in enumerate(widths):
            for row in t.rows:
                row.cells[i].width = Inches(w)
    d.add_paragraph()


def PARAM(d, name, value, what, why):
    """The deliberately boring 'What it is / Value / Why' block."""
    H3(d, name)
    P(d, f"**What it is:** {what}")
    P(d, f"**The value we use:** {value}")
    P(d, f"**Why this value:** {why}")


# ════════════════════════════════════════════════════════════════════════════
# SHARED SECTION 1 — deep-learning basics (identical opening for both files)
# ════════════════════════════════════════════════════════════════════════════
def basics(d, modelname):
    H1(d, "1. Background: the concepts you need before anything else")
    P(d, "This section defines, one at a time, every basic concept used in the rest of "
         "this document. If you already know deep learning you may skip it, but every later "
         "section assumes only what is written here.")

    H2(d, "1.1 What a model is")
    P(d, "A **model** is a mathematical function with adjustable numbers inside it. You give "
         "it an input (in our case, a recording of body and hand positions over time) and it "
         "produces an output (in our case, a list of scores, one score for each sign it "
         "knows). The adjustable numbers inside the function are called **weights** (also "
         "called **parameters**). Before training, the weights are random and the model's "
         "answers are useless. Training is the process of gradually adjusting the weights "
         "until the answers become correct.")

    H2(d, "1.2 What a tensor is")
    P(d, "A **tensor** is just a grid of numbers with a defined shape. A list of 3 numbers "
         "is a tensor of shape (3). A table with 30 rows and 177 columns is a tensor of "
         "shape (30, 177). A stack of 60 such tables would be a 3-dimensional tensor. When "
         f"this document writes a shape like (60, 543, 3), read it as: 60 time steps, each "
         "containing 543 points, each point described by 3 numbers. Everything the "
         f"{modelname} model consumes and produces is a tensor.")

    H2(d, "1.3 What training means, mechanically")
    P(d, "Training repeats the same four-step cycle millions of times:")
    NUM(d, "**Forward pass.** Push one batch of training examples through the model and "
           "collect its (initially wrong) predictions.")
    NUM(d, "**Loss computation.** Compare the predictions to the known correct answers "
           "using a formula called the **loss function**. The loss is a single number: "
           "large when the model is wrong, small when it is right.")
    NUM(d, "**Backward pass (backpropagation).** Compute, for every single weight in the "
           "model, in which direction that weight should move to make the loss smaller. "
           "This direction information is called the **gradient**.")
    NUM(d, "**Weight update.** Move every weight a tiny step in its improving direction. "
           "The size of the step is controlled by the **learning rate**. The recipe that "
           "decides exactly how to apply the step is called the **optimizer**.")
    P(d, "That is all training is. Every fancy term later in this document is a refinement "
         "of one of these four steps.")

    H2(d, "1.4 Epochs, batches and iterations")
    P(d, "**Batch:** the model does not look at one example at a time; it processes a group "
         "of examples simultaneously (for efficiency and stability). The group is a batch, "
         "and its size is the **batch size**. "
         "**Iteration (step):** one full cycle of the four steps above on one batch. "
         "**Epoch:** one complete pass through the entire training dataset. If the dataset "
         "has 5,904 examples and the batch size is 64, one epoch is 93 iterations.")

    H2(d, "1.5 Train, validation and test splits")
    P(d, "The dataset is divided into three non-overlapping parts. The **training split** is "
         "what the model learns from. The **validation split** is never learned from; it is "
         "measured during training to check whether the model is genuinely improving on data "
         "it has not memorized. The **test split** is touched exactly once, at the very end, "
         "to report the final numbers. Our split is **70% / 15% / 15%**.")

    H2(d, "1.6 Overfitting, generalization and regularization")
    P(d, "**Overfitting** is when a model memorizes its training examples instead of "
         "learning the underlying pattern; its training accuracy looks excellent while its "
         "accuracy on new data is poor. **Generalization** is the opposite: performing well "
         "on data it has never seen. Every technique whose purpose is to prevent "
         "memorization is collectively called **regularization**. This document describes "
         "each regularization technique the model uses, one by one, in Section 6.")

    H2(d, "1.7 Logits, softmax and confidence")
    P(d, "The raw output of the model is one number per class, called **logits**. Logits "
         "can be any value (negative, large, small) and are hard to interpret. The "
         "**softmax** function converts the list of logits into a list of positive numbers "
         "that sum to exactly 1.0, so each number can be read as a probability. The largest "
         "of these probabilities is what we call the model's **confidence** in its top "
         "answer. Example: logits (2.1, 0.3, −1.0) become probabilities (0.81, 0.13, 0.06).")


# ════════════════════════════════════════════════════════════════════════════
# FILE 1 — ASL
# ════════════════════════════════════════════════════════════════════════════
def build_asl():
    d = new_doc("The ASL Recognition Model",
                "Training, data augmentation and inference — a complete, step-by-step "
                "description assuming no prior deep-learning knowledge")

    H1(d, "0. What this document covers")
    P(d, "This document describes, in full detail and in deliberately plain language, the "
         "American Sign Language (ASL) recognition model used in the Together project: what "
         "data it was trained on, how that data is prepared (preprocessing), how the data is "
         "artificially varied during training (augmentation), what the model's internal "
         "structure is (architecture), exactly how it was trained (optimizer, schedule, "
         "regularization), what results it achieved, and precisely what happens at run time "
         "when a user signs in front of a webcam (inference). A companion document covers "
         "the Arabic (ArSL) model in the same way.")

    basics(d, "ASL")

    # ── data ──
    H1(d, "2. The training data")
    H2(d, "2.1 Where the data comes from")
    P(d, "The model is trained on the **Google Isolated Sign Language Recognition (ISLR) "
         "dataset**, a public dataset published for a machine-learning competition. It "
         "contains approximately **100,000 short recordings** of individual ASL signs, "
         "covering a vocabulary of exactly **250 different signs**, performed by **21 Deaf "
         "adult signers**. Each recording is a few seconds long and contains exactly one "
         "sign (this is called **isolated** sign recognition, as opposed to recognizing "
         "continuous sentences of signing).")
    H2(d, "2.2 What one training example physically is")
    P(d, "Crucially, the dataset does **not** contain videos. Each example is a sequence of "
         "**landmarks** that were already extracted from the original videos using "
         "**MediaPipe Holistic**, a computer-vision tool made by Google. MediaPipe looks at "
         "each video frame and outputs the (x, y, z) position of **543 specific points** on "
         "the person: 468 points on the face, 33 points on the body (called the pose), and "
         "21 points on each hand. So one video frame becomes a grid of 543 × 3 numbers, and "
         "a whole recording becomes a tensor of shape (number-of-frames, 543, 3). Working "
         "with landmarks instead of pixels has three advantages: the data is thousands of "
         "times smaller, the person's identity and background are discarded (privacy), and "
         "the model cannot be distracted by lighting or clothing.")
    H2(d, "2.3 The subset and the split")
    P(d, "The project trained on a working subset of **4,078 sequences**, divided "
         "**70% / 15% / 15%** into training, validation and test splits as defined in "
         "Section 1.5. One important honesty note: this split is random over recordings, "
         "meaning the same signer can appear in both training and test. The consequences of "
         "that choice, and the additional cross-dataset evaluation performed to compensate "
         "for it, are described in Section 8.")
    H2(d, "2.4 When a landmark is missing")
    P(d, "MediaPipe sometimes fails to see a hand (out of frame, blurred, occluded). For "
         "those frames the missing points are stored as **NaN** (\"not a number\", a special "
         "placeholder meaning \"no value\"). This matters enormously at inference time: the "
         "model was trained to treat NaN as \"missing\" and to ignore it internally. If a "
         "missing point is instead written as 0.0, the model reads it as a real point sitting "
         "at the top-left corner of the image and its accuracy collapses. Rule: **missing "
         "landmarks must stay NaN, never zero.**")

    # ── preprocessing ──
    H1(d, "3. Preprocessing: from 543 raw points to 708 model features")
    P(d, "Preprocessing is a fixed, non-learned recipe applied to every sequence before the "
         "neural network sees it. Its purpose is to remove information that should not "
         "matter (where the person stands, how far from the camera they are) and to add "
         "information that helps (how the points are moving). One engineering detail first: "
         "in the deployed model this whole recipe is **baked inside the exported model "
         "file** (the TFLite graph), so the browser only ever sends raw landmarks; during "
         "training the recipe produced tensors of shape **(384, 708)** that the network "
         "core consumed. The steps, in order:")
    NUM(d, "**Select 118 of the 543 points.** Most of the 468 face points carry no signing "
           "information. The recipe keeps only the informative ones: the lips (because "
           "mouth shape is part of signing), both 21-point hands, and the upper body — "
           "118 points in total. This throws away nothing that matters and shrinks the "
           "input by almost 5×.")
    NUM(d, "**Drop the z axis.** Each point has (x, y, z), but the depth estimate (z) from "
           "a single ordinary camera is unreliable. Only (x, y) are kept. Each frame is now "
           "118 points × 2 numbers = 236 numbers.")
    NUM(d, "**Center on the nose.** From every point, subtract the position of the nose "
           "point of that same frame. After this, all coordinates are expressed relative to "
           "the nose, so it no longer matters where in the camera frame the person is "
           "standing. (In plain arithmetic: new_x = x − nose_x, new_y = y − nose_y.)")
    NUM(d, "**Normalize by the clip's standard deviation.** Compute one number σ (sigma) "
           "for the whole clip — the standard deviation, a measure of how spread out all "
           "the coordinate values are — and divide every coordinate by it. A person close "
           "to the camera and a person far away now produce nearly identical numbers. This "
           "is **scale invariance**.")
    NUM(d, "**Add motion features.** A sign is a movement, not a pose. For every point at "
           "every frame, the recipe appends: the **velocity** (this frame's position minus "
           "the previous frame's position, written Δ¹) and the **acceleration** (how the "
           "velocity itself changes between frames, written Δ²). With position (2 numbers), "
           "velocity (2) and acceleration (2), each of the 118 points now contributes 6 "
           "numbers: 118 × 6 = **708 features per frame**.")
    NUM(d, "**Pad to a fixed length of 384 frames.** Neural networks train most efficiently "
           "on fixed-size tensors. Shorter sequences are padded (extended with filler "
           "frames) up to 384; the final training tensor per example is **(384, 708)**.")

    # ── architecture ──
    H1(d, "4. The architecture, layer by layer")
    P(d, "The architecture is the fixed wiring of the model — the sequence of mathematical "
         "operations the input flows through. Ours adapts the **Squeezeformer** design, the "
         "family that won the Google ISLR competition. Overall flow: a **stem** projects "
         "each 708-number frame to a 192-number internal representation; then the sequence "
         "passes through **two repetitions of [three Conv1D blocks followed by one "
         "Transformer block]**; then **global average pooling** collapses time; then a "
         "final classification layer produces **250 logits**. Every term is defined below.")
    H2(d, "4.1 The stem (a linear projection)")
    P(d, "A **linear layer** (also called dense or fully-connected) multiplies its input by "
         "a learned weight matrix and adds a learned offset. The stem is a linear layer with "
         "a 708 × 192 weight matrix: it converts each frame's 708 features into 192 new "
         "numbers the rest of the network works with. Why 192: a compact size that balances "
         "accuracy against speed. Shape flow so far: (384, 708) → (384, 192).")
    H2(d, "4.2 What a convolution is, and the Conv1D block")
    P(d, "A **convolution** slides a small learned window (a **kernel**) along the data and "
         "computes a weighted sum at each position. In 1-D, the window slides along **time**: "
         "a kernel of size 17 looks at 17 consecutive frames at once and produces one output "
         "per position. Convolutions are how the model detects short, local motion patterns "
         "(a flick, a hold, a direction change). Each of the 192 internal features is called "
         "a **channel**.")
    P(d, "One **Conv1D block** performs, in order:")
    NUM(d, "**Point-wise convolution (kernel size 1).** A per-frame linear mixing of "
           "channels that first expands 192 channels to 384 — giving the block more room "
           "to compute.")
    NUM(d, "**Causal depthwise convolution (kernel size 17) + BatchNorm.** \"Depthwise\" "
           "means each channel is convolved separately (cheap); \"causal\" is defined in "
           "4.3. **Batch normalization (BatchNorm)** rescales the numbers flowing through "
           "the network to a healthy range, which keeps training stable; it is a standard "
           "stabilizer, not something exotic.")
    NUM(d, "**Efficient Channel Attention (ECA).** A tiny sub-module that lets the block "
           "decide which channels are currently important. It averages each channel over "
           "time (one number per channel), runs a very small convolution across those "
           "numbers, squashes the result to the range 0–1 with a **sigmoid** function, and "
           "multiplies each channel by its 0–1 weight. Channels judged unhelpful are "
           "dimmed; helpful ones pass through.")
    NUM(d, "**Point-wise convolution back to 192 channels**, then a **residual "
           "connection**: the block's input is added onto its output. Residual connections "
           "give the training signal a direct path through the network, which is what makes "
           "deep networks trainable at all.")
    P(d, "The activation function between these steps is **swish**, defined as "
         "x·sigmoid(x). An **activation function** is a simple non-linear squashing applied "
         "between layers; without one, stacking layers would collapse into a single linear "
         "operation and the model could not learn complex patterns.")
    H2(d, "4.3 Causal padding (why the model never looks into the future)")
    P(d, "A convolution at the edge of a sequence needs values beyond the edge; **padding** "
         "supplies them. Ordinary \"same\" padding adds filler on both sides, which lets "
         "frame t be influenced by frames after t — the future. **Causal padding** adds "
         "filler only on the past side, so every output at time t depends exclusively on "
         "frames ≤ t. This matters because the deployed system feeds the model a live, "
         "still-growing stream; a model trained with visibility into the future would "
         "behave differently live than in training. Causal padding removes that mismatch by "
         "construction.")
    H2(d, "4.4 The Transformer block")
    P(d, "Convolutions see 17 frames at a time; a sign can span far more. The **Transformer "
         "block** provides that long view through **self-attention**: for every frame, the "
         "model computes how relevant every other frame is to it, and builds each frame's "
         "new representation as a relevance-weighted mixture of all frames. Ours uses "
         "**multi-head** self-attention with **4 heads** — four independent attention "
         "computations, each of dimension 48, run in parallel so different heads can track "
         "different relationships. The block also contains a small two-layer **feed-forward "
         "network** (two linear layers with a swish between), and both sub-parts have "
         "residual connections and **layer normalization** (a per-frame cousin of "
         "BatchNorm).")
    H2(d, "4.5 Pooling, the classifier, and the three-tower ensemble")
    P(d, "After the two [3 × Conv1D + Transformer] repetitions the tensor is still "
         "(384, 192). **Global average pooling (GAP)** takes the average over the 384 time "
         "steps, leaving one 192-number summary of the whole clip. A final linear layer maps "
         "those 192 numbers to **250 logits**, one per sign. Softmax (Section 1.7) turns "
         "them into probabilities.")
    P(d, "One deployment detail: the shipped model file actually contains **three complete, "
         "independently trained copies** of this network (an **ensemble**). At run time all "
         "three run and their logits are **averaged** before the softmax. Three models make "
         "partially independent mistakes; averaging cancels some of those mistakes and "
         "makes the final answer more reliable. Cost: three times the computation, which "
         "Section 9 shows is still fast enough.")

    # ── augmentation ──
    H1(d, "5. Data augmentation: manufacturing variety during training")
    P(d, "**Data augmentation** means randomly distorting each training example, every time "
         "it is used, so the model never sees the exact same input twice. This is the single "
         "most effective defense against overfitting (Section 1.6), and it deliberately "
         "simulates the messiness of real webcams. Augmentation is applied **only during "
         "training** — never at validation, test, or run time. The five augmentations, "
         "applied randomly per example:")
    TABLE(d,
          ["Augmentation", "Exact setting", "What it does", "What real-world effect it simulates"],
          [
           ["Temporal resampling", "speed factor between 0.5× and 1.5×",
            "stretches or compresses the recording in time",
            "people signing slower or faster"],
           ["Temporal masking", "20% to 40% of frames blanked",
            "hides random stretches of frames",
            "tracking dropouts, momentary occlusion"],
           ["Horizontal flip", "applied randomly",
            "mirrors the whole recording left-right",
            "left-handed signers"],
           ["Random affine", "scale, shift, shear; rotation up to ±30°",
            "geometrically warps all points consistently",
            "different camera angles and positions"],
           ["Spatial cutout", "random region of points blanked",
            "removes a spatial patch of landmarks",
            "partial occlusion of the body or hand"],
          ],
          widths=[1.5, 1.7, 2.0, 2.2])

    # ── training ──
    H1(d, "6. The training procedure, setting by setting")
    P(d, "Training ran for **400 epochs** (Section 1.4) with the categorical cross-entropy "
         "loss, the RAdam optimizer wrapped in Lookahead, a cosine learning-rate schedule, "
         "and three stacked regularizers. Each element is now defined individually, in the "
         "same fixed format.")
    PARAM(d, "6.1 The loss function: categorical cross-entropy (CCE)",
          "categorical cross-entropy with label smoothing ε = 0.1, over K = 250 classes",
          "The formula that scores how wrong the model's 250 probabilities are compared to "
          "the correct sign. It heavily punishes being confidently wrong and is the standard "
          "loss for any pick-one-of-K classification problem.",
          "Plain CCE pushes the model toward absolute 100% certainty, which encourages "
          "memorization. **Label smoothing** softens the target: instead of teaching \"the "
          "correct class has probability 1.0 and all others 0.0\", it teaches \"the correct "
          "class has 0.9 and the remaining 0.1 is spread over the other classes\". "
          "ε (epsilon) = 0.1 is that softening amount. The model stays slightly humble, "
          "which measurably improves generalization.")
    PARAM(d, "6.2 The optimizer: RAdam + Lookahead",
          "RAdam, wrapped in the Lookahead mechanism",
          "The optimizer is the recipe that converts gradients into actual weight updates "
          "(step 4 of Section 1.3). **Adam** is the most common modern recipe: it gives "
          "every weight its own adaptive step size. **RAdam** (Rectified Adam) fixes a "
          "known instability of Adam during the first few hundred steps of training. "
          "**Lookahead** is a wrapper that keeps two copies of the weights: a fast copy "
          "that explores ahead for a few steps, and a slow copy that periodically moves "
          "toward wherever the fast copy ended up — averaging out erratic jumps.",
          "The combination trains stably from the very first step without needing a "
          "hand-tuned warmup period, and reliably lands in flatter, better-generalizing "
          "regions of the loss landscape.")
    PARAM(d, "6.3 The learning rate and its schedule",
          "base learning rate 5e-4 (0.0005), scaled to an effective 4e-3 (0.004) because "
          "training ran on 8 devices in parallel; decayed to ~0 over 400 epochs following "
          "a cosine curve; no warmup",
          "The learning rate is the step size of every weight update. The **schedule** is "
          "the plan for changing it over the course of training. A **cosine schedule** "
          "starts at the full value and decreases smoothly along a cosine-shaped curve, "
          "fast in the middle and gentle at both ends. (The 8× scaling exists because "
          "training on 8 devices processes 8 batches at once — an 8× larger effective "
          "batch — and the standard practice is to scale the learning rate to match.)",
          "Early training benefits from large steps (fast progress); late training needs "
          "tiny steps (fine adjustment without destroying what was learned). Cosine decay "
          "delivers exactly that transition with no extra tuning knobs, and RAdam's "
          "stability makes a warmup phase unnecessary.")
    PARAM(d, "6.4 Regularizer 1: Drop-Path (stochastic depth)",
          "drop probability p = 0.2",
          "During training only, each residual block (each Conv1D or Transformer block) is "
          "randomly switched off entirely — its contribution skipped — with probability "
          "0.2 for each batch. The residual connections mean the signal still flows "
          "through; the network simply computes without that block for that batch.",
          "The network cannot rely on any single block existing, so every block is forced "
          "to learn something independently useful. It behaves like training a large family "
          "of shallower networks that share weights, which strongly resists overfitting.")
    PARAM(d, "6.5 Regularizer 2: late dropout",
          "dropout probability 0.8 on the final dense layer",
          "**Dropout** randomly zeroes a fraction of the values passing through a layer "
          "during training (and does nothing at test time). Here it is applied just before "
          "the final classification layer, at an unusually aggressive 80%.",
          "The classifier sees a randomly mutilated summary every batch, so it cannot "
          "build its decision on any small set of specific features — it must spread its "
          "evidence broadly across the representation. With 250 classes and a modest "
          "dataset, this brute-force humility is what keeps the final layer honest.")
    PARAM(d, "6.6 Regularizer 3: Adversarial Weight Perturbation (AWP)",
          "perturbation strength λ = 0.2",
          "Before each weight update, AWP first nudges every weight a small amount in the "
          "direction that makes the loss **worse** (the adversarial direction), computes "
          "the gradients at that nudged point, and then applies the update to the original "
          "weights. In effect the model is optimized to do well even when its own weights "
          "are slightly wrong.",
          "It steers training toward **flat minima** — regions where small weight changes "
          "barely change the loss. Flat minima are strongly associated with better "
          "generalization to new signers and new recording conditions, which is exactly "
          "the weakness a landmark model must fight.")
    H2(d, "6.7 Reading the training curves")
    P(d, "The thesis's Figure 4.10 plots accuracy and loss per epoch for both splits. Three "
         "observations a beginner should be able to defend: (1) validation accuracy climbs "
         "and flattens at approximately **0.80** with no late decline — no overfitting "
         "collapse; (2) the loss curves fall smoothly — the schedule and optimizer are "
         "stable; (3) validation accuracy sits **above** training accuracy, which looks "
         "backwards until you remember Sections 5 and 6: all five augmentations and all "
         "three regularizers are active **only** on the training pass, so the training "
         "split is graded on artificially hardened examples while validation is graded on "
         "clean ones.")

    # ── results ──
    H1(d, "7. What the trained model achieves")
    TABLE(d, ["Metric", "Meaning in plain words", "Value"],
          [
           ["Top-1 accuracy (test split)", "how often the single highest-probability answer is correct", "**80.00%**"],
           ["Top-5 accuracy", "how often the correct sign is anywhere in the best five answers", "95.00%"],
           ["Macro precision", "averaged per class: when the model says a sign, how often it is right", "0.81"],
           ["Macro recall", "averaged per class: of all true occurrences of a sign, how many it catches", "0.80"],
           ["Macro F1", "the balance (harmonic mean) of the two above", "0.80"],
           ["Cross-entropy loss (test)", "the loss value itself on the test split", "0.90"],
          ], widths=[2.2, 3.3, 1.2])
    P(d, "Because the random split shares signers between training and test (Section 2.3), "
         "the project also evaluated the same trained model on a completely different "
         "corpus, SignASL, containing different people, cameras and conditions. There it "
         "scores **62.4% Top-1** over the 250 classes. The drop from 80% is expected; that "
         "it still recognizes the majority of signs on foreign data is the evidence that it "
         "learned sign structure rather than dataset quirks.")

    # ── inference ──
    H1(d, "8. Inference: exactly what happens when someone signs, step by step")
    P(d, "**Inference** means using the trained model to answer, with all weights frozen. "
         "The complete run-time path from webcam to spoken sentence:")
    NUM(d, "**Capture.** The browser reads webcam frames at up to 30 frames per second.")
    NUM(d, "**Landmark extraction, in the browser.** MediaPipe Holistic (running as "
           "WebAssembly inside the page) converts each frame to the 543 landmarks of "
           "Section 2.2. The raw video never leaves the user's machine — only these "
           "coordinate numbers are transmitted. Frames where a hand is not detected carry "
           "**NaN** for its 21 points (never zero — see Section 2.4).")
    NUM(d, "**Smoothing and buffering.** The landmark stream is lightly smoothed to remove "
           "jitter, gaps are held over briefly, and frames accumulate in a **rolling "
           "buffer of the most recent 60 frames** (about 2–3 seconds of signing).")
    NUM(d, "**Transmission.** The buffered window of shape (60, 543, 3) is posted to the "
           "server's /api/translate endpoint.")
    NUM(d, "**Model execution.** The server runs the TFLite model (all preprocessing of "
           "Section 3 happens inside the exported graph, then the three towers run and "
           "their logits are averaged). Execution uses the **XNNPACK** backend — an "
           "optimized CPU library — with up to 4 processor threads. Measured cost: "
           "**43.47 ms on average per call** (58.7 ms worst case), on an ordinary CPU with "
           "no graphics card.")
    NUM(d, "**Confidence gate.** Softmax converts logits to probabilities. If the top "
           "probability is **not above 0.80**, the prediction is discarded — the system "
           "prefers silence over guessing.")
    NUM(d, "**Majority vote.** Predictions that pass the gate enter a short voting buffer; "
           "a sign is only **accepted** when it wins the majority of the most recent "
           "**15 predictions**. A single lucky frame can never emit a word; the signer "
           "must hold the sign's identity across roughly half a second of inferences.")
    NUM(d, "**Gloss accumulation.** Each accepted sign is appended to a growing word list "
           "(the **gloss**) shown live to the user. A repeat of the same sign is blocked "
           "until a cooldown expires, so one held sign does not print twice.")
    NUM(d, "**Sentence formation.** When no hands are visible for **5 seconds**, the "
           "system treats the utterance as finished, sends the gloss to the language-model "
           "layer, which rewrites it as a grammatical English sentence, and optionally "
           "speaks it aloud through text-to-speech.")
    P(d, "In the two-person meeting mode this identical pipeline runs live over a WebRTC "
         "call: the signer's side produces captions and speech for the hearing participant "
         "while the reverse (speech-to-sign) pipeline runs concurrently in the other "
         "direction.")

    H1(d, "9. One-page summary table")
    TABLE(d, ["Item", "Value"],
          [
           ["Task", "isolated ASL sign classification, 250 classes"],
           ["Dataset", "Google ISLR — ~100k sequences, 250 signs, 21 signers; 4,078-sequence subset"],
           ["Split", "70% train / 15% validation / 15% test (random)"],
           ["Input to deployed model", "(60, 543, 3) raw MediaPipe landmarks; missing = NaN"],
           ["Preprocessing (inside graph)", "118 points, drop z, nose-center, σ-normalize, +velocity +acceleration → 708 features; pad to 384"],
           ["Architecture", "stem 708→192 · 2 × [3 Conv1D blocks + Transformer] · GAP · dense → 250"],
           ["Attention", "multi-head self-attention, 4 heads, head dimension 48"],
           ["Deployment form", "TFLite, 3-tower ensemble averaged at logits, XNNPACK, ≤4 threads"],
           ["Augmentation", "temporal resample 0.5–1.5× · mask 20–40% · h-flip · affine ±30° · cutout"],
           ["Loss", "categorical cross-entropy, label smoothing ε = 0.1"],
           ["Optimizer", "RAdam + Lookahead"],
           ["Learning rate", "5e-4 base → 4e-3 effective (8 replicas), cosine decay, no warmup, 400 epochs"],
           ["Regularization", "Drop-Path 0.2 · dropout 0.8 (final dense) · AWP λ = 0.2"],
           ["Headline results", "80.00% top-1 test · 95.00% top-5 · 62.4% cross-dataset (SignASL)"],
           ["Run-time gating", "softmax gate 0.80 · majority vote over 15 · 5 s pause → sentence"],
           ["Latency", "43.47 ms average per inference (58.7 ms max), CPU only"],
          ], widths=[2.2, 4.5])

    d.save(os.path.join(HERE, "ASL_Model_Complete_Guide.docx"))
    print("ASL guide saved")


# ════════════════════════════════════════════════════════════════════════════
# FILE 2 — ArSL
# ════════════════════════════════════════════════════════════════════════════
def build_arsl():
    d = new_doc("The ArSL Recognition Model",
                "Training, data augmentation and inference — a complete, step-by-step "
                "description assuming no prior deep-learning knowledge")

    H1(d, "0. What this document covers")
    P(d, "This document describes, in full detail and in deliberately plain language, the "
         "Arabic / Egyptian Sign Language (ArSL) recognition model used in the Together "
         "project: its training data, the preprocessing recipe, the artificial data "
         "variation used during training (augmentation), the model's internal structure "
         "(a compact CNN-GRU network), the exact training settings, the results, and "
         "precisely what happens at run time (inference), including the INT8 quantization "
         "that makes it extremely fast. A companion document covers the ASL model. The "
         "background section below is identical in both documents; read it once.")

    basics(d, "ArSL")

    # ── data ──
    H1(d, "2. The training data")
    H2(d, "2.1 Where the data comes from")
    P(d, "The model is trained on the **Balaha ArSL-20 dataset**, a public dataset of "
         "**8,437 short clips** covering a vocabulary of **20 Egyptian Arabic signs** "
         "(words such as mother, father, eat, house, thanks), performed by **72 different "
         "signers** and recorded with **phone cameras** — realistic, imperfect footage. "
         "Compared to the ASL data this is small in vocabulary but unusually rich in "
         "signers, and that signer diversity is what later allows an honest "
         "\"unseen-signer\" evaluation (Section 8).")
    H2(d, "2.2 Why this model must be small")
    P(d, "8,437 examples is little data by deep-learning standards. A large model (such as "
         "the Transformer used for ASL) has so many adjustable weights that, on this little "
         "data, it would simply memorize the training clips — the overfitting failure of "
         "Section 1.6. The design answer is a deliberately **compact** architecture "
         "(Section 4) plus augmentation (Section 5) and early stopping (Section 6). "
         "Matching model size to data size is the central engineering decision of this "
         "model.")
    H2(d, "2.3 The split")
    P(d, "The 8,437 clips are divided **70% / 15% / 15%** into training, validation and "
         "test (Section 1.5), stratified so every sign keeps the same proportions in each "
         "split. As with the ASL model, this random split shares signers across splits; a "
         "separate **signer-independent** evaluation, where whole people are held out of "
         "training, is reported in Section 8.")

    # ── preprocessing ──
    H1(d, "3. Preprocessing: from a video clip to a (30, 177) tensor")
    P(d, "Unlike the ASL model (whose preprocessing is baked into its exported file), the "
         "ArSL preprocessing runs as ordinary server code before the network is called. "
         "Every clip, at training and at run time, goes through exactly these steps:")
    NUM(d, "**Extract 59 landmarks per frame.** MediaPipe provides 543 points; this model "
           "keeps only **17 upper-body pose points** (pose indices 0 through 16 — head and "
           "shoulders down to the wrists) and the **21 points of each hand**: "
           "17 + 21 + 21 = 59 points. The face mesh and lower body are discarded — for a "
           "20-word vocabulary the hands and upper body carry the signal.")
    NUM(d, "**Zero the z axis.** The depth estimate from phone cameras is noisy and varies "
           "between devices, so the third coordinate of every point is set to 0.0. Only "
           "(x, y) carry information. Each frame is 59 points × 3 numbers = 177 numbers "
           "(the zeroed z is kept as a placeholder so the layout stays fixed).")
    NUM(d, "**Center on the shoulder midpoint.** Compute the point halfway between the "
           "left shoulder (pose index 11) and the right shoulder (pose index 12), and "
           "subtract it from every landmark of that frame. All positions are now relative "
           "to the person's chest, so their location in the camera frame is irrelevant "
           "(**position invariance**).")
    NUM(d, "**Scale by the shoulder width.** Divide every coordinate by the distance "
           "between the two shoulders. A person filling the frame and a person far from "
           "the camera now produce the same numbers (**scale invariance**). If the pose is "
           "missing in a frame, safe defaults are used so the arithmetic never fails.")
    NUM(d, "**Resample to exactly 30 frames.** Clips have different lengths, but the "
           "network expects a fixed 30 time steps. The recipe picks 30 evenly spaced "
           "frames across the clip (the k-th picked frame is at position "
           "floor(k × (T−1) / 29) of a T-frame clip). A fast sign and a slow sign both "
           "become 30 frames. Final tensor per clip: **(30, 177)** — 30 time steps, 177 "
           "numbers each.")
    NUM(d, "**Interpolate missing hands.** If the hand tracker lost a hand for some "
           "frames in the middle of a clip, the gap is filled by drawing a straight line "
           "between the last seen and next seen positions of each point, so the model "
           "never sees a hand teleport or vanish for a single frame.")

    # ── architecture ──
    H1(d, "4. The architecture, layer by layer: a CNN-GRU hybrid")
    P(d, "The network has three stages: two **convolutional** blocks that detect short "
         "local motion patterns, a **bidirectional GRU** that reads the whole 30-frame "
         "sequence in order (twice — forwards and backwards), and a small **classifier "
         "head** that outputs 20 scores. Total flow: (30, 177) → (30, 128) → (30, 128) → "
         "(30, 128 via BiGRU) → last step (128) → (64) → (20 logits).")
    H2(d, "4.1 The two convolution blocks")
    P(d, "A **1-D convolution** slides a small learned window along the 30 time steps (the "
         "same concept as in the ASL document, Section 4.2). Block one maps the 177 input "
         "features to **128 channels** with a kernel of size 3 (it looks at 3 consecutive "
         "frames at a time); block two keeps 128 → 128, again kernel 3. Each block is "
         "followed by **batch normalization** (a standard rescaling that keeps training "
         "stable) and the **ReLU** activation — the simplest non-linearity there is: "
         "negative values become 0, positive values pass unchanged. Two stacked kernel-3 "
         "blocks give each output a view of a 5-frame neighborhood — enough to encode "
         "elementary motion fragments before the recurrent stage.")
    H2(d, "4.2 What a recurrent network is, and the GRU")
    P(d, "A **recurrent neural network (RNN)** processes a sequence one step at a time "
         "while carrying a **hidden state** — a vector of numbers acting as its running "
         "memory of everything seen so far. At each frame it combines the new input with "
         "the previous hidden state to produce the next hidden state. A plain RNN forgets "
         "quickly; the **GRU (Gated Recurrent Unit)** fixes this with two learned "
         "**gates** — small internal valves, each producing values between 0 and 1: the "
         "**reset gate** decides how much of the old memory to consult when proposing new "
         "content, and the **update gate** decides how much of the memory to overwrite "
         "versus keep. With gates, relevant information can persist across all 30 frames.")
    H2(d, "4.3 Bidirectionality, and why it is free accuracy here")
    P(d, "One GRU reads frames 1 → 30; a second, independent GRU reads 30 → 1. At every "
         "time step their two hidden states are concatenated, so each position's "
         "representation knows both the beginning and the end of the sign. This is "
         "legitimate here — and was **not** legitimate for the ASL model's live "
         "convolutions — because this model always receives a complete, already-buffered "
         "clip: the \"future\" frames physically exist in the buffer before the network "
         "runs. Ours is a **two-layer** bidirectional GRU with **64 hidden units** per "
         "direction (64 + 64 = 128 outputs per frame) and dropout 0.3 between layers.")
    H2(d, "4.4 The classifier head")
    P(d, "The hidden state at the **final time step** (which, being bidirectional, has "
         "seen the entire sequence) is taken as the clip summary: 128 numbers. A linear "
         "layer maps 128 → 64 with ReLU and dropout 0.5, and a final linear layer maps "
         "64 → **20 logits**, one per sign. Softmax (Section 1.7) converts them to "
         "probabilities.")

    # ── augmentation ──
    H1(d, "5. Data augmentation: manufacturing variety during training")
    P(d, "As defined in the ASL document: random distortions applied only during training, "
         "so the model never sees identical inputs twice and cannot memorize. The four "
         "augmentations used for this model:")
    TABLE(d,
          ["Augmentation", "Exact setting", "What it does", "Why"],
          [
           ["Horizontal mirroring", "applied to 50% of samples",
            "flips all landmarks left-right",
            "left-handed signers; doubles effective pose variety"],
           ["Inactive-hand masking", "applied with probability 70%; the inactive hand is "
            "found by its low spatial variance (it barely moves)",
            "blanks the resting hand's landmarks",
            "one-handed signs must not depend on where the idle hand happens to rest"],
           ["Affine scale + noise", "scale 0.92× to 1.08×, plus Gaussian noise with "
            "σ = 0.008 on every coordinate",
            "slightly grows/shrinks the skeleton and adds jitter",
            "camera distance variation and landmark-tracker measurement noise"],
           ["Temporal jitter", "small random shifts in frame sampling",
            "perturbs which 30 frames are picked",
            "the same sign is never sliced identically twice"],
          ],
          widths=[1.6, 2.4, 1.7, 1.7])

    # ── training ──
    H1(d, "6. The training procedure, setting by setting")
    PARAM(d, "6.1 The loss function",
          "categorical cross-entropy (no label smoothing), over K = 20 classes",
          "The standard pick-one-of-K classification loss, exactly as defined in the ASL "
          "document's Section 6.1.",
          "With only 20 well-separated classes and strong augmentation, plain CCE is "
          "sufficient; the extra humility of label smoothing was not needed to reach "
          "excellent validation behavior.")
    PARAM(d, "6.2 The optimizer: Adam with weight decay",
          "Adam, weight decay 1e-4 (0.0001)",
          "Adam is the standard adaptive optimizer described in the ASL document. "
          "**Weight decay** is an additional regularizer: at every update, every weight is "
          "also shrunk very slightly toward zero.",
          "Weight decay discourages any individual weight from growing huge, which is "
          "another way of preventing the network from memorizing specific training clips. "
          "1e-4 is a mild, standard strength.")
    PARAM(d, "6.3 The learning rate and its schedule: ReduceLROnPlateau",
          "initial learning rate 1e-3 (0.001); halved whenever the validation loss fails "
          "to improve for 3 consecutive epochs",
          "Instead of a pre-planned curve (like the ASL model's cosine), this schedule "
          "**reacts to the training itself**: it watches the validation loss, and when "
          "progress stalls (a \"plateau\") for 3 epochs, it cuts the learning rate in "
          "half so the optimizer can settle into finer detail.",
          "On a small dataset the loss curve is noisy and hard to pre-plan for; a "
          "reactive schedule is the safe, self-tuning choice.")
    PARAM(d, "6.4 Batch size and epoch budget",
          "batch size 64; at most 100 epochs",
          "64 clips are processed per iteration; the full training split is revisited up "
          "to 100 times.",
          "64 is a standard middle ground: large enough for stable gradient estimates, "
          "small enough to fit comfortably in memory. 100 epochs is an upper bound only — "
          "see early stopping next.")
    PARAM(d, "6.5 Early stopping",
          "patience 12: training stops when validation loss has not improved for 12 "
          "consecutive epochs; the best-scoring weights are kept",
          "An automatic brake. After every epoch the validation loss is checked; the "
          "moment 12 epochs pass without a new best value, training halts and the weights "
          "from the best epoch (saved as best_model.pth) are restored.",
          "The longer a small-data model trains past its best point, the more it drifts "
          "into memorization. Early stopping removes the human from that judgement call. "
          "In practice the model converged well before the 100-epoch ceiling.")
    PARAM(d, "6.6 Dropout (the model's built-in regularizers)",
          "0.3 between the two GRU layers; 0.5 before the final classification layer",
          "Dropout, as defined in the ASL document: randomly zeroing that fraction of "
          "values during training only.",
          "The recurrent stage gets the lighter 0.3 (recurrent memories are fragile); the "
          "classifier gets the heavier 0.5, forcing the final decision to rest on broad "
          "evidence rather than a few specific numbers.")
    H2(d, "6.7 Reading the training curves")
    P(d, "The thesis's Figure 4.16 shows both curves converging within roughly the first "
         "30 epochs and flattening: accuracy approaching 1.0 and loss approaching 0 on "
         "both splits, with the two curves close together — the signature of a model whose "
         "capacity matches its data. The final validation accuracy annotation reads "
         "≈ 0.994.")

    # ── results ──
    H1(d, "7. What the trained model achieves")
    TABLE(d, ["Metric", "Meaning in plain words", "Value"],
          [
           ["Top-1 accuracy (test split)", "how often the single best answer is correct", "**99.41%**"],
           ["Top-5 accuracy", "how often the correct sign is in the best five", "100.00%"],
           ["Macro precision", "per-class average correctness of its claims", "0.99"],
           ["Macro recall", "per-class average coverage of true occurrences", "0.99"],
           ["Macro F1", "balance of the two above", "0.99"],
           ["Cross-entropy loss (test)", "the loss value on the test split", "0.03"],
          ], widths=[2.2, 3.3, 1.2])
    P(d, "The honest caveat: the split shares signers, so part of that 99.41% may come "
         "from recognizing **people** rather than signs. Therefore the model was also "
         "evaluated **signer-independently** — entire signers held out of training, tested "
         "only on people the model has never seen. Result: **88%**. The ~11-point gap "
         "quantifies exactly how much of the in-distribution score depended on "
         "signer-specific cues; 88% on unseen phone-camera signers remains a strong result "
         "for a 20-class model, and it is the number to quote when asked about real-world "
         "performance.")
    P(d, "The full 20 × 20 **confusion matrix** (a table counting, for every true sign, "
         "what the model predicted) is almost perfectly diagonal — the few errors are "
         "single confusions between visually adjacent signs.")

    # ── inference ──
    H1(d, "8. Inference: exactly what happens at run time, step by step")
    NUM(d, "**Capture and extraction.** Identical to the ASL pipeline: the browser runs "
           "MediaPipe Holistic and streams landmark frames; raw video never leaves the "
           "device. The interface language is Arabic (right-to-left), and the Arabic "
           "dashboard routes recognition to this model.")
    NUM(d, "**Buffering.** Frames accumulate in a rolling buffer on the server, exactly "
           "as for ASL.")
    NUM(d, "**Server-side preprocessing.** Unlike ASL, the recipe of Section 3 runs here "
           "as ordinary code: select the 59 landmarks, zero z, shoulder-center, "
           "shoulder-scale, resample to 30 frames, interpolate hand gaps → a (30, 177) "
           "tensor.")
    NUM(d, "**Multi-window ensemble.** The model is not run once. Three windows of the "
           "recent stream — the last **30, 45 and 60 frames**, each resampled down to "
           "30 — are pushed through the network as a batch of three, and the three "
           "softmax probability lists are **averaged**. Why: at run time nobody knows "
           "exactly when the sign started; a short window may clip it, a long one may "
           "include dead time before it. Averaging the three views makes the answer far "
           "less sensitive to that unknown alignment.")
    NUM(d, "**Confidence gate.** The averaged probabilities are checked: if the top one "
           "is **not above τ = 0.45**, nothing is emitted. (The threshold is lower than "
           "ASL's 0.80 because with 20 classes instead of 250, random noise concentrates "
           "less probability on any single wrong class; 0.45 is still nine times the "
           "1-in-20 chance level.)")
    NUM(d, "**Vote and cooldown.** As with ASL, a passing prediction must win a small "
           "majority vote across consecutive inferences (2 of 3 on the live stream) "
           "before the sign is accepted, and a cooldown blocks immediate repeats.")
    NUM(d, "**Display and sentence formation.** The accepted class key is mapped to its "
           "Arabic word for display, the gloss accumulates, and on a pause the "
           "language-model layer composes a grammatical **Arabic** sentence, optionally "
           "spoken via Arabic text-to-speech.")

    H2(d, "8.1 INT8 quantization: why this model answers in 4 milliseconds")
    P(d, "The trained weights are ordinary 32-bit floating-point numbers (**float32** — "
         "high precision, 4 bytes each). **Quantization** converts the weights of the "
         "heavy layers (the linear layers and the GRU) to **8-bit integers** (**INT8** — "
         "whole numbers from −128 to 127, 1 byte each), together with a stored scaling "
         "factor that maps them back to their approximate real values. \"**Dynamic** "
         "quantization\" means weights are stored in INT8 while the activations flowing "
         "through are quantized on the fly at run time. The costs and gains, measured on "
         "this exact model on CPU (50 runs, synthetic input):")
    TABLE(d, ["Version", "Average time per inference", "Accuracy impact"],
          [
           ["float32 (original)", "7.48 ms", "—"],
           ["INT8 dynamic (deployed)", "**4.21 ms** — a **1.78×** speed-up", "no measurable change"],
          ], widths=[2.0, 2.7, 2.0])
    P(d, "Why it works: integer arithmetic is much faster than floating-point on ordinary "
         "CPUs, and a small, well-trained model tolerates the tiny rounding introduced. "
         "Why it matters: 4.21 ms per call means recognition is effectively free next to "
         "network transport, and no graphics card is ever needed. One engineering note: "
         "the model object is shared by all requests, so a lock serializes access to it — "
         "two users' inferences queue for milliseconds rather than corrupting each other.")

    H1(d, "9. One-page summary table")
    TABLE(d, ["Item", "Value"],
          [
           ["Task", "isolated Egyptian ArSL sign classification, 20 classes"],
           ["Dataset", "Balaha ArSL-20 — 8,437 phone-camera clips, 72 signers"],
           ["Split", "70% / 15% / 15%, stratified; plus signer-independent protocol"],
           ["Input tensor", "(30, 177): 30 resampled frames × 59 landmarks × (x, y, z=0)"],
           ["Preprocessing", "59 points · zero z · shoulder-center · shoulder-scale · resample 30 · hand-gap interpolation"],
           ["Architecture", "Conv1D 177→128 (k=3) + BN + ReLU · Conv1D 128→128 · 2-layer BiGRU 64 (→128) · FC 128→64→20"],
           ["Augmentation", "mirror 50% · inactive-hand mask 70% · affine 0.92–1.08 + noise σ=0.008 · temporal jitter"],
           ["Loss / optimizer", "cross-entropy · Adam, weight decay 1e-4"],
           ["LR schedule", "1e-3, halved after 3 stagnant epochs (ReduceLROnPlateau)"],
           ["Budget", "batch 64 · ≤100 epochs · early stopping patience 12"],
           ["Dropout", "0.3 (GRU) / 0.5 (classifier)"],
           ["Headline results", "99.41% top-1 test · 100% top-5 · 88% signer-independent"],
           ["Run-time ensemble", "windows {30, 45, 60} → mean softmax · gate τ = 0.45 · 2/3 vote"],
           ["Quantization", "INT8 dynamic (Linear + GRU): 7.48 → 4.21 ms (1.78×), CPU only"],
          ], widths=[2.2, 4.5])

    d.save(os.path.join(HERE, "ArSL_Model_Complete_Guide.docx"))
    print("ArSL guide saved")


build_asl()
build_arsl()
print("BOTH GUIDES BUILT")
