# -*- coding: utf-8 -*-
"""Slide rendering engine for the Together graduation-defense deck.

Renders 1920x1080 slide PNGs in the Together design language (teal/sand/ink),
with automatic text wrapping + shrink-to-fit (logged), then assembles the
PPTX (full-bleed slide images + editable speaker notes) and a PDF preview.

Design tokens mirror design-system-ref/tokens/colors.css and the thesis
figure palette (validated teal #0d8f83 / sand #b97f3e).
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H = 1920, 1080
M = 110                      # outer margin

TEAL = "#0d8f83"
TEAL_DARK = "#0a6b62"
SAND = "#b97f3e"
INK = "#11233a"
BODY = "#34343d"
MUTED = "#545868"
FAINT = "#969dab"
HAIR = "#e4e7ee"
PAPER = "#ffffff"
CREAM = "#f7f6f2"
CARD = "#f4f7f7"

FDIR = "/usr/share/fonts/truetype/liberation"
SERIF_B = f"{FDIR}/LiberationSerif-Bold.ttf"
SERIF_R = f"{FDIR}/LiberationSerif-Regular.ttf"
SERIF_I = f"{FDIR}/LiberationSerif-Italic.ttf"
SANS_R = f"{FDIR}/LiberationSans-Regular.ttf"
SANS_B = f"{FDIR}/LiberationSans-Bold.ttf"

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
WARNINGS = []


def F(path, size):
    return ImageFont.truetype(path, size)


def text_w(font, s):
    b = font.getbbox(s)
    return b[2] - b[0]


def wrap(font, s, width):
    words = s.split()
    lines, cur = [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if text_w(font, t) <= width:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


def fit_text(draw, box, s, fontpath, max_size, min_size, color, slide_no,
             line_gap=1.22, align="left", valign="top", bold_prefix=None):
    """Wrap + shrink text to fit box. Returns bottom y actually used."""
    x0, y0, x1, y1 = box
    size = max_size
    while size >= min_size:
        font = F(fontpath, size)
        lines = wrap(font, s, x1 - x0)
        lh = int(size * line_gap)
        total = lh * len(lines)
        if total <= (y1 - y0):
            break
        size -= 2
    else:
        WARNINGS.append(f"slide {slide_no}: text shrunk below min ({s[:40]}...)")
        size = min_size
        font = F(fontpath, size)
        lines = wrap(font, s, x1 - x0)
        lh = int(size * line_gap)
        total = lh * len(lines)
    y = y0 if valign == "top" else y0 + ((y1 - y0) - total) // 2
    for ln in lines:
        if align == "center":
            x = x0 + ((x1 - x0) - text_w(font, ln)) // 2
        elif align == "right":
            x = x1 - text_w(font, ln)
        else:
            x = x0
        draw.text((x, y), ln, font=font, fill=color)
        y += lh
    return y


def paste_fit(img, path, box, border=False, pad=0):
    """Contain-fit an image into box, centered. Returns pasted rect."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0 - 2 * pad, y1 - y0 - 2 * pad
    pic = Image.open(path).convert("RGB")
    r = min(bw / pic.width, bh / pic.height)
    nw, nh = int(pic.width * r), int(pic.height * r)
    pic = pic.resize((nw, nh), Image.LANCZOS)
    px = x0 + pad + (bw - nw) // 2
    py = y0 + pad + (bh - nh) // 2
    img.paste(pic, (px, py))
    if border:
        d = ImageDraw.Draw(img)
        d.rectangle([px - 1, py - 1, px + nw, py + nh], outline="#d7dee6", width=2)
    return (px, py, px + nw, py + nh)


def paste_eq(img, path, box):
    """Contain-fit a transparent equation PNG (keeps alpha)."""
    x0, y0, x1, y1 = box
    pic = Image.open(path).convert("RGBA")
    r = min((x1 - x0) / pic.width, (y1 - y0) / pic.height)
    pic = pic.resize((int(pic.width * r), int(pic.height * r)), Image.LANCZOS)
    px = x0 + ((x1 - x0) - pic.width) // 2
    py = y0 + ((y1 - y0) - pic.height) // 2
    img.paste(pic, (px, py), pic)


def logo(img, path, cx, cy, height):
    pic = Image.open(path).convert("RGBA")
    r = height / pic.height
    pic = pic.resize((int(pic.width * r), height), Image.LANCZOS)
    img.paste(pic, (int(cx - pic.width / 2), int(cy - pic.height / 2)), pic)


# ── chrome ──────────────────────────────────────────────────────────────
def base(bg=PAPER):
    img = Image.new("RGB", (W, H), bg)
    return img, ImageDraw.Draw(img)


def footer(img, draw, n, section):
    y = H - 64
    draw.line([(M, y), (W - M, y)], fill=HAIR, width=2)
    f = F(SANS_R, 24)
    draw.text((M, y + 14), "Together — FUE Graduation Defense · July 2026",
              font=f, fill=FAINT)
    s = section.upper()
    draw.text((W - M - text_w(F(SANS_B, 24), s) - 90, y + 14), s,
              font=F(SANS_B, 24), fill=FAINT)
    num = f"{n:02d}"
    draw.text((W - M - text_w(F(SANS_B, 26), num), y + 13), num,
              font=F(SANS_B, 26), fill=TEAL)


def header(draw, kicker, title, slide_no, title_size=64):
    draw.text((M, 72), kicker.upper(), font=F(SANS_B, 27), fill=TEAL)
    # letterspacing simulation
    y = fit_text(draw, (M, 118, W - M, 260), title, SERIF_B, title_size, 40,
                 INK, slide_no, line_gap=1.12)
    return y + 8


def bullets(draw, items, box, slide_no, size=34, gap=None, color=BODY,
            marker=TEAL, bold_lead=True):
    """items: list of str or (lead, rest) tuples. '~' prefix = sand marker."""
    x0, y0, x1, y1 = box
    n = len(items)
    avail = y1 - y0
    y = y0
    for it in items:
        mk = marker
        if isinstance(it, str) and it.startswith("~"):
            it = it[1:]
            mk = SAND
        lead, rest = (it if isinstance(it, tuple) else (None, it))
        fnt = F(SANS_R, size)
        draw.rectangle([x0, y + int(size * 0.32), x0 + 14, y + int(size * 0.32) + 14],
                       fill=mk)
        tx = x0 + 40
        if lead:
            fb = F(SANS_B, size)
            draw.text((tx, y), lead + "  ", font=fb, fill=INK)
            lx = tx + text_w(fb, lead + "  ")
            lines = wrap(fnt, rest, x1 - lx)
            draw.text((lx, y), lines[0] if lines else "", font=fnt, fill=color)
            yy = y + int(size * 1.3)
            for ln in lines[1:]:
                draw.text((tx, yy), ln, font=fnt, fill=color)
                yy += int(size * 1.3)
            y = yy + (gap if gap is not None else int(size * 0.65))
        else:
            lines = wrap(fnt, rest, x1 - tx)
            yy = y
            for ln in lines:
                draw.text((tx, yy), ln, font=fnt, fill=color)
                yy += int(size * 1.3)
            y = yy + (gap if gap is not None else int(size * 0.65))
        if y > y1 + 10:
            WARNINGS.append(f"slide {slide_no}: bullets overflow box")
    return y


# ── slide archetypes ────────────────────────────────────────────────────
def slide_title(meta):
    img, d = base()
    # top band
    d.rectangle([0, 0, W, 14], fill=TEAL)
    logo(img, f"{ASSETS}/fue_lockup.jpeg", W // 2, 135, 165)
    fit_text(d, (M, 235, W - M, 285), "Faculty of Engineering and Technology — Computers & Intelligent Systems Engineering",
             SANS_B, 28, 22, MUTED, 1, align="center")
    logo(img, f"{ASSETS}/logo_color.png", W // 2, 385, 155)
    fit_text(d, (M, 480, W - M, 610), "Together", SERIF_B, 110, 80, TEAL, 1, align="center")
    fit_text(d, (M, 612, W - M, 680), "An AI-Based Sign-Language Translator (ASL & ArSL)",
             SERIF_B, 52, 36, INK, 1, align="center")
    fit_text(d, (M, 690, W - M, 730), "Graduation Project Defense",
             SERIF_I, 34, 24, MUTED, 1, align="center")
    # team grid
    names = [("Abdelfattah Moustafa", "20225889"), ("Michael Abdallah", "20213601"),
             ("Ahmed Mohamed Nagib", "20170423"), ("Ahmed Ashraf Shawareb", "20180097")]
    bx = (W - 1500) // 2
    for i, (nm, sid) in enumerate(names):
        cx = bx + (i % 4) * 375
        d.rounded_rectangle([cx, 775, cx + 350, 875], radius=14, fill=CARD,
                            outline=HAIR, width=2)
        fit_text(d, (cx + 14, 795, cx + 336, 835), nm, SANS_B, 27, 20, INK, 1, align="center")
        fit_text(d, (cx + 14, 838, cx + 336, 868), sid, SANS_R, 24, 20, MUTED, 1, align="center")
    fit_text(d, (M, 920, W - M, 960), "Supervisor:  Prof. Medhat Awadallah",
             SANS_B, 30, 24, BODY, 1, align="center")
    fit_text(d, (M, 968, W - M, 1005), "July 2026", SANS_R, 27, 22, FAINT, 1, align="center")
    return img


def slide_divider(meta):
    img, d = base(TEAL)
    # watermark logo
    try:
        pic = Image.open(f"{ASSETS}/logo_white.png").convert("RGBA")
        r = 560 / pic.height
        pic = pic.resize((int(pic.width * r), 560), Image.LANCZOS)
        alpha = pic.split()[3].point(lambda a: int(a * 0.14))
        pic.putalpha(alpha)
        img.paste(pic, (W - pic.width - 60, H - pic.height - 40), pic)
    except Exception:
        pass
    d.text((M, 150), meta["num"], font=F(SERIF_B, 150), fill=SAND)
    fit_text(d, (M, 350, W - 350, 620), meta["title"], SERIF_B, 96, 60,
             PAPER, meta["n"], line_gap=1.08)
    d.line([(M, 660), (M + 180, 660)], fill=SAND, width=6)
    if meta.get("sub"):
        fit_text(d, (M, 700, W - 420, 880), meta["sub"], SANS_R, 34, 26,
                 "#d7efe9", meta["n"], line_gap=1.35)
    d.text((M, H - 90), "TOGETHER — GRADUATION DEFENSE", font=F(SANS_B, 24),
           fill="#7fc4ba")
    d.text((W - M - text_w(F(SANS_B, 26), f"{meta['n']:02d}"), H - 92),
           f"{meta['n']:02d}", font=F(SANS_B, 26), fill=PAPER)
    return img


def slide_stat(meta):
    img, d = base()
    header(d, meta["kicker"], meta["title"], meta["n"])
    fit_text(d, (M, 360, W - M, 660), meta["stat"], SERIF_B, 230, 120,
             TEAL, meta["n"], align="center", valign="middle")
    fit_text(d, (W // 6, 690, W - W // 6, 800), meta["context"], SANS_R, 40, 28,
             BODY, meta["n"], align="center", line_gap=1.3)
    if meta.get("source"):
        fit_text(d, (M, 860, W - M, 910), meta["source"], SANS_R, 26, 20,
                 FAINT, meta["n"], align="center")
    footer(img, d, meta["n"], meta["section"])
    return img


def slide_content(meta):
    """bullets left / image right — or image bottom/full via meta['layout'].
    meta['eq'] = path to a rendered equation PNG -> cream panel above the footer."""
    img, d = base()
    ytop = header(d, meta["kicker"], meta["title"], meta["n"])
    lay = meta.get("layout", "right")
    items = meta.get("bullets", [])
    imgs = meta.get("images", [])
    border = meta.get("border", False)
    bot = H - 90
    if meta.get("eq"):
        eq_pic = Image.open(meta["eq"])
        ph = min(230, max(130, int(eq_pic.height / eq_pic.width * (W - 2 * M) ) + 44))
        panel_top = H - 90 - ph
        d.rounded_rectangle([M, panel_top, W - M, H - 90], radius=14, fill=CREAM)
        paste_eq(img, meta["eq"], (M + 30, panel_top + 14, W - M - 30, H - 104))
        bot = panel_top - 20
    if lay == "full" and imgs:
        paste_fit(img, imgs[0], (M, ytop + 10, W - M, bot), border=border)
    elif lay == "bottom":
        if items:
            bullets(d, items, (M, ytop + 6, W - M, ytop + 210), meta["n"],
                    size=meta.get("bsize", 32))
        iy = ytop + (220 if items else 10)
        if len(imgs) == 2:
            paste_fit(img, imgs[0], (M, iy, W // 2 - 20, bot), border=border)
            paste_fit(img, imgs[1], (W // 2 + 20, iy, W - M, bot), border=border)
        elif imgs:
            paste_fit(img, imgs[0], (M, iy, W - M, bot), border=border)
    else:  # right
        split = meta.get("split", 0.44)
        bx1 = M + int((W - 2 * M) * split)
        if items:
            bullets(d, items, (M, ytop + 26, bx1 - 40, bot - 20), meta["n"],
                    size=meta.get("bsize", 34))
        if len(imgs) == 2:
            mid = ytop + 10 + (bot - 10 - ytop) // 2
            paste_fit(img, imgs[0], (bx1, ytop + 10, W - M, mid - 8), border=border)
            paste_fit(img, imgs[1], (bx1, mid + 8, W - M, bot - 10), border=border)
        elif imgs:
            paste_fit(img, imgs[0], (bx1, ytop + 10, W - M, bot - 10), border=border)
    if meta.get("note_strip"):
        d.rounded_rectangle([M, H - 175, W - M, H - 100], radius=12, fill=CREAM)
        fit_text(d, (M + 30, H - 160, W - M - 30, H - 112), meta["note_strip"],
                 SANS_R, 27, 20, MUTED, meta["n"], valign="middle")
    footer(img, d, meta["n"], meta["section"])
    return img


def slide_cards(meta):
    img, d = base()
    ytop = header(d, meta["kicker"], meta["title"], meta["n"])
    cards = meta["cards"]          # list of (title, body) or (num, title, body)
    cols = meta.get("cols", 3)
    rows = (len(cards) + cols - 1) // cols
    gw = (W - 2 * M - (cols - 1) * 36) // cols
    gh = min(240, (H - 120 - ytop - (rows - 1) * 30) // rows)
    for i, c in enumerate(cards):
        r, k = divmod(i, cols)
        x = M + k * (gw + 36)
        y = ytop + 24 + r * (gh + 30)
        d.rounded_rectangle([x, y, x + gw, y + gh], radius=16, fill=CARD,
                            outline=HAIR, width=2)
        if len(c) == 3:
            num, t, b = c
            d.text((x + 28, y + 20), num, font=F(SERIF_B, 44), fill=SAND)
            fit_text(d, (x + 100, y + 26, x + gw - 24, y + 76), t, SANS_B, 30,
                     22, INK, meta["n"])
            fit_text(d, (x + 28, y + 88, x + gw - 24, y + gh - 18), b, SANS_R,
                     26, 20, MUTED, meta["n"], line_gap=1.28)
        else:
            t, b = c
            fit_text(d, (x + 28, y + 22, x + gw - 24, y + 72), t, SANS_B, 30,
                     22, TEAL_DARK, meta["n"])
            fit_text(d, (x + 28, y + 82, x + gw - 24, y + gh - 18), b, SANS_R,
                     26, 20, BODY, meta["n"], line_gap=1.28)
    footer(img, d, meta["n"], meta["section"])
    return img


def slide_table(meta):
    img, d = base()
    ytop = header(d, meta["kicker"], meta["title"], meta["n"])
    headers = meta["headers"]
    rows = meta["rows"]
    widths = meta.get("widths")  # fractions
    x0, x1 = M, W - M
    total = x1 - x0
    if widths:
        cw = [int(total * f) for f in widths]
    else:
        cw = [total // len(headers)] * len(headers)
    xs = [x0]
    for c in cw:
        xs.append(xs[-1] + c)
    y = ytop + 26
    rh_head = 66
    rh = min(84, (H - 130 - y - rh_head) // max(1, len(rows)))
    # header band
    d.rounded_rectangle([x0, y, x1, y + rh_head], radius=10, fill=TEAL)
    for i, htxt in enumerate(headers):
        fit_text(d, (xs[i] + 20, y + 14, xs[i + 1] - 14, y + rh_head - 8),
                 htxt, SANS_B, 28, 18, PAPER, meta["n"])
    y += rh_head
    fsize = meta.get("fsize", 26)
    for ri, row in enumerate(rows):
        if ri % 2 == 1:
            d.rectangle([x0, y, x1, y + rh], fill="#f6f8f8")
        for i, val in enumerate(row):
            emph = isinstance(val, tuple)
            txt = val[0] if emph else val
            fit_text(d, (xs[i] + 20, y + 10, xs[i + 1] - 14, y + rh - 6), txt,
                     SANS_B if emph else SANS_R, fsize, 16,
                     TEAL_DARK if emph else BODY, meta["n"], line_gap=1.15)
        d.line([(x0, y + rh), (x1, y + rh)], fill=HAIR, width=2)
        y += rh
    footer(img, d, meta["n"], meta["section"])
    return img


def slide_closing(meta):
    img, d = base(INK)
    d.rectangle([0, 0, W, 14], fill=TEAL)
    logo(img, f"{ASSETS}/logo_white.png", W // 2, 300, 190)
    fit_text(d, (W // 8, 430, W - W // 8, 640), meta["title"], SERIF_B, 72, 44,
             PAPER, meta["n"], align="center", line_gap=1.15, valign="middle")
    if meta.get("sub"):
        fit_text(d, (W // 6, 680, W - W // 6, 800), meta["sub"], SANS_R, 34,
                 24, "#b9c6d8", meta["n"], align="center", line_gap=1.35)
    if meta.get("foot"):
        fit_text(d, (M, 930, W - M, 980), meta["foot"], SANS_R, 26, 20,
                 "#7f8ea6", meta["n"], align="center")
    return img


RENDERERS = {
    "title": slide_title, "divider": slide_divider, "stat": slide_stat,
    "content": slide_content, "cards": slide_cards, "table": slide_table,
    "closing": slide_closing,
}


def render_deck(slides, outdir):
    os.makedirs(outdir, exist_ok=True)
    paths = []
    for i, meta in enumerate(slides, start=1):
        meta["n"] = i
        img = RENDERERS[meta["type"]](meta)
        p = os.path.join(outdir, f"slide_{i:02d}.png")
        img.save(p)
        paths.append(p)
    return paths
