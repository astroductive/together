"""Minimal, dependency-free QR Code generator (byte + alphanumeric mode).

Written from the ISO/IEC 18004 spec so the app can render a meeting-link QR
under a strict CSP (no external libraries, no CDN). Supports versions 1-10 and
error-correction levels L/M — ample for a meeting URL (~40-60 chars).

Correctness is pinned by a unit test against the canonical "HELLO WORLD"
version-1, level-M, mask-0 matrix (tests/test_qr.py).
"""
from __future__ import annotations

# ── Galois field GF(256) tables (primitive poly 0x11d) ──────────────────────
_EXP = [0] * 512
_LOG = [0] * 256
_x = 1
for _i in range(255):
    _EXP[_i] = _x
    _LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11d
for _i in range(255, 512):
    _EXP[_i] = _EXP[_i - 255]


def _gf_mul(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return _EXP[_LOG[a] + _LOG[b]]


def _rs_generator(n: int) -> list[int]:
    g = [1]
    for i in range(n):
        g2 = [0] * (len(g) + 1)
        for j in range(len(g)):
            g2[j] ^= _gf_mul(g[j], 1)
            g2[j + 1] ^= _gf_mul(g[j], _EXP[i])
        g = g2
    return g


def _rs_encode(data: list[int], n_ec: int) -> list[int]:
    gen = _rs_generator(n_ec)
    res = list(data) + [0] * n_ec
    for i in range(len(data)):
        coef = res[i]
        if coef != 0:
            for j in range(len(gen)):
                res[i + j] ^= _gf_mul(gen[j], coef)
    return res[len(data):]


# ── Capacity / EC tables for versions 1-10, levels L & M ────────────────────
# (ec_codewords_per_block, num_blocks_group1, data_cw_group1,
#  num_blocks_group2, data_cw_group2)
_EC_BLOCKS = {
    ('L', 1): (7, 1, 19, 0, 0), ('M', 1): (10, 1, 16, 0, 0),
    ('L', 2): (10, 1, 34, 0, 0), ('M', 2): (16, 1, 28, 0, 0),
    ('L', 3): (15, 1, 55, 0, 0), ('M', 3): (26, 1, 44, 0, 0),
    ('L', 4): (20, 1, 80, 0, 0), ('M', 4): (18, 2, 32, 0, 0),
    ('L', 5): (26, 1, 108, 0, 0), ('M', 5): (24, 2, 43, 0, 0),
    ('L', 6): (18, 2, 68, 0, 0), ('M', 6): (16, 4, 27, 0, 0),
    ('L', 7): (20, 2, 78, 0, 0), ('M', 7): (18, 4, 31, 0, 0),
    ('L', 8): (24, 2, 97, 0, 0), ('M', 8): (22, 2, 38, 2, 39),
    ('L', 9): (30, 2, 116, 0, 0), ('M', 9): (22, 3, 36, 2, 37),
    ('L', 10): (18, 2, 68, 2, 69), ('M', 10): (26, 4, 43, 1, 44),
}

# Total data codewords per (level, version)
_DATA_CW = {}
for (lvl, ver), (ecc, b1, d1, b2, d2) in _EC_BLOCKS.items():
    _DATA_CW[(lvl, ver)] = b1 * d1 + b2 * d2

_ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

# format-info BCH strings, indexed by (level_bits<<3 | mask). Precomputed.
_FMT_MASK = 0x5412
_FMT_G = 0x537


def _bch_format(data5: int) -> int:
    d = data5 << 10
    while d.bit_length() > 10:
        d ^= _FMT_G << (d.bit_length() - 11)
    return ((data5 << 10) | d) ^ _FMT_MASK


_VER_G = 0x1f25


def _bch_version(ver: int) -> int:
    d = ver << 12
    while d.bit_length() > 12:
        d ^= _VER_G << (d.bit_length() - 13)
    return (ver << 12) | d


def _alignment_positions(ver: int) -> list[int]:
    if ver == 1:
        return []
    # spec table for versions 2-10
    table = {
        2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
        7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
    }
    return table[ver]


def _is_alnum(s: str) -> bool:
    return all(c in _ALNUM for c in s)


def _pick_version(text: str, level: str) -> tuple[int, str]:
    mode = 'alnum' if _is_alnum(text) else 'byte'
    data_bytes = text.encode('utf-8')
    for ver in range(1, 11):
        cap_bits = _DATA_CW[(level, ver)] * 8
        cci = _cci_bits(ver, mode)
        if mode == 'alnum':
            n = len(text)
            bits = 4 + cci + (n // 2) * 11 + (6 if n % 2 else 0)
        else:
            bits = 4 + cci + len(data_bytes) * 8
        if bits <= cap_bits:
            return ver, mode
    raise ValueError("text too long for supported QR versions (1-10)")


def _cci_bits(ver: int, mode: str) -> int:
    if mode == 'byte':
        return 8 if ver <= 9 else 16
    # alphanumeric
    return 9 if ver <= 9 else 11


class _Bits:
    def __init__(self):
        self.bits: list[int] = []

    def add(self, value: int, length: int):
        for i in range(length - 1, -1, -1):
            self.bits.append((value >> i) & 1)


def _encode_data(text: str, ver: int, mode: str, level: str) -> list[int]:
    bs = _Bits()
    cci = _cci_bits(ver, mode)
    if mode == 'alnum':
        bs.add(0b0010, 4)
        bs.add(len(text), cci)
        i = 0
        while i + 1 < len(text):
            bs.add(_ALNUM.index(text[i]) * 45 + _ALNUM.index(text[i + 1]), 11)
            i += 2
        if i < len(text):
            bs.add(_ALNUM.index(text[i]), 6)
    else:
        data = text.encode('utf-8')
        bs.add(0b0100, 4)
        bs.add(len(data), cci)
        for b in data:
            bs.add(b, 8)

    total_cw = _DATA_CW[(level, ver)]
    cap = total_cw * 8
    # terminator
    for _ in range(min(4, cap - len(bs.bits))):
        bs.bits.append(0)
    # pad to byte boundary
    while len(bs.bits) % 8:
        bs.bits.append(0)
    # pad codewords
    codewords = [int(''.join(map(str, bs.bits[i:i + 8])), 2) for i in range(0, len(bs.bits), 8)]
    pads = [0xEC, 0x11]
    k = 0
    while len(codewords) < total_cw:
        codewords.append(pads[k % 2])
        k += 1
    return codewords


def _interleave(codewords: list[int], ver: int, level: str) -> list[int]:
    ecc, b1, d1, b2, d2 = _EC_BLOCKS[(level, ver)]
    blocks = []
    idx = 0
    for _ in range(b1):
        blocks.append(codewords[idx:idx + d1]); idx += d1
    for _ in range(b2):
        blocks.append(codewords[idx:idx + d2]); idx += d2
    ec_blocks = [_rs_encode(b, ecc) for b in blocks]
    out = []
    maxd = max(len(b) for b in blocks)
    for i in range(maxd):
        for b in blocks:
            if i < len(b):
                out.append(b[i])
    for i in range(ecc):
        for b in ec_blocks:
            out.append(b[i])
    return out


def _build_matrix(final_cw: list[int], ver: int, level: str) -> list[list[int]]:
    size = 17 + ver * 4
    m = [[None] * size for _ in range(size)]
    reserved = [[False] * size for _ in range(size)]

    def place_finder(r, c):
        for dr in range(-1, 8):
            for dc in range(-1, 8):
                rr, cc = r + dr, c + dc
                if 0 <= rr < size and 0 <= cc < size:
                    on = (0 <= dr <= 6 and 0 <= dc <= 6 and
                          (dr in (0, 6) or dc in (0, 6) or (2 <= dr <= 4 and 2 <= dc <= 4)))
                    m[rr][cc] = 1 if on else 0
                    reserved[rr][cc] = True

    place_finder(0, 0)
    place_finder(0, size - 7)
    place_finder(size - 7, 0)

    # timing patterns
    for i in range(size):
        if m[6][i] is None:
            m[6][i] = 1 if i % 2 == 0 else 0
            reserved[6][i] = True
        if m[i][6] is None:
            m[i][6] = 1 if i % 2 == 0 else 0
            reserved[i][6] = True

    # alignment patterns
    aps = _alignment_positions(ver)
    for r in aps:
        for c in aps:
            if reserved[r][c]:
                continue
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    on = dr in (-2, 2) or dc in (-2, 2) or (dr == 0 and dc == 0)
                    m[r + dr][c + dc] = 1 if on else 0
                    reserved[r + dr][c + dc] = True

    # dark module
    m[size - 8][8] = 1
    reserved[size - 8][8] = True

    # reserve format-info areas
    for i in range(9):
        for (r, c) in ((8, i), (i, 8)):
            if not reserved[r][c]:
                reserved[r][c] = True
                if m[r][c] is None:
                    m[r][c] = 0
    for i in range(8):
        reserved[8][size - 1 - i] = True
        reserved[size - 1 - i][8] = True

    # reserve version info (v>=7)
    if ver >= 7:
        for i in range(6):
            for j in range(3):
                reserved[i][size - 11 + j] = True
                reserved[size - 11 + j][i] = True

    # place data bits (zig-zag)
    bits = []
    for cw in final_cw:
        for i in range(7, -1, -1):
            bits.append((cw >> i) & 1)
    bit_i = 0
    col = size - 1
    upward = True
    while col > 0:
        if col == 6:
            col -= 1
        cols = [col, col - 1]
        rows = range(size - 1, -1, -1) if upward else range(size)
        for r in rows:
            for c in cols:
                if not reserved[r][c] and m[r][c] is None:
                    m[r][c] = bits[bit_i] if bit_i < len(bits) else 0
                    bit_i += 1
        upward = not upward
        col -= 2

    return m, reserved


def _apply_mask(m, reserved, mask):
    size = len(m)
    out = [row[:] for row in m]
    for r in range(size):
        for c in range(size):
            if reserved[r][c]:
                continue
            if mask == 0:
                cond = (r + c) % 2 == 0
            elif mask == 1:
                cond = r % 2 == 0
            elif mask == 2:
                cond = c % 3 == 0
            elif mask == 3:
                cond = (r + c) % 3 == 0
            elif mask == 4:
                cond = (r // 2 + c // 3) % 2 == 0
            elif mask == 5:
                cond = (r * c) % 2 + (r * c) % 3 == 0
            elif mask == 6:
                cond = ((r * c) % 2 + (r * c) % 3) % 2 == 0
            else:
                cond = ((r + c) % 2 + (r * c) % 3) % 2 == 0
            if cond:
                out[r][c] ^= 1
    return out


def _place_format(m, level, mask):
    size = len(m)
    lvl_bits = {'L': 0b01, 'M': 0b00, 'Q': 0b11, 'H': 0b10}[level]
    fmt = _bch_format((lvl_bits << 3) | mask)
    # LSB-first: coords1[0]=(0,8) holds bit 0, coords1[14]=(8,0) holds bit 14
    # (verified against OpenCV's encoder).
    bits = [(fmt >> i) & 1 for i in range(15)]
    # top-left
    coords1 = [(0, 8), (1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (7, 8), (8, 8),
               (8, 7), (8, 5), (8, 4), (8, 3), (8, 2), (8, 1), (8, 0)]
    for b, (r, c) in zip(bits, coords1):
        m[r][c] = b
    # split copy
    coords2 = [(8, size - 1), (8, size - 2), (8, size - 3), (8, size - 4),
               (8, size - 5), (8, size - 6), (8, size - 7), (8, size - 8),
               (size - 7, 8), (size - 6, 8), (size - 5, 8), (size - 4, 8),
               (size - 3, 8), (size - 2, 8), (size - 1, 8)]
    for b, (r, c) in zip(bits, coords2):
        m[r][c] = b


def _place_version(m, ver):
    if ver < 7:
        return
    size = len(m)
    vinfo = _bch_version(ver)
    bits = [(vinfo >> i) & 1 for i in range(17, -1, -1)][::-1]
    k = 0
    for i in range(6):
        for j in range(3):
            b = bits[k]; k += 1
            m[i][size - 11 + j] = b
            m[size - 11 + j][i] = b


def _penalty(m):
    size = len(m)
    score = 0
    # rule 1: runs
    for line in (m, list(zip(*m))):
        for row in line:
            run = 1
            for i in range(1, size):
                if row[i] == row[i - 1]:
                    run += 1
                else:
                    if run >= 5:
                        score += 3 + (run - 5)
                    run = 1
            if run >= 5:
                score += 3 + (run - 5)
    # rule 2: 2x2 blocks
    for r in range(size - 1):
        for c in range(size - 1):
            if m[r][c] == m[r][c + 1] == m[r + 1][c] == m[r + 1][c + 1]:
                score += 3
    # rule 3: finder-like patterns
    patt = [1, 0, 1, 1, 1, 0, 1]
    for line in (m, list(zip(*m))):
        for row in line:
            for i in range(size - 6):
                if list(row[i:i + 7]) == patt:
                    if i >= 4 and all(row[i - 4 + k] == 0 for k in range(4)):
                        score += 40
                    if i + 7 + 4 <= size and all(row[i + 7 + k] == 0 for k in range(4)):
                        score += 40
    # rule 4: dark proportion
    dark = sum(sum(row) for row in m)
    total = size * size
    ratio = dark * 100 // total
    score += min(abs(ratio - 50) // 5, abs((ratio) - 50) // 5) * 10
    return score


def generate_matrix(text: str, level: str = 'M') -> list[list[int]]:
    ver, mode = _pick_version(text, level)
    codewords = _encode_data(text, ver, mode, level)
    final_cw = _interleave(codewords, ver, level)
    base, reserved = _build_matrix(final_cw, ver, level)
    best = None
    best_score = None
    for mask in range(8):
        masked = _apply_mask(base, reserved, mask)
        _place_format(masked, level, mask)
        _place_version(masked, ver)
        sc = _penalty(masked)
        if best_score is None or sc < best_score:
            best_score = sc
            best = masked
    return best


def generate_matrix_mask(text: str, level: str, mask: int) -> list[list[int]]:
    """Deterministic single-mask matrix — used by the correctness test."""
    ver, mode = _pick_version(text, level)
    codewords = _encode_data(text, ver, mode, level)
    final_cw = _interleave(codewords, ver, level)
    base, reserved = _build_matrix(final_cw, ver, level)
    masked = _apply_mask(base, reserved, mask)
    _place_format(masked, level, mask)
    _place_version(masked, ver)
    return masked


def svg(text: str, level: str = 'M', quiet: int = 4, scale: int = 6) -> str:
    m = generate_matrix(text, level)
    size = len(m)
    dim = (size + quiet * 2) * scale
    rects = []
    for r in range(size):
        for c in range(size):
            if m[r][c]:
                x = (c + quiet) * scale
                y = (r + quiet) * scale
                rects.append(f'<rect x="{x}" y="{y}" width="{scale}" height="{scale}"/>')
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{dim}" height="{dim}" '
        f'viewBox="0 0 {dim} {dim}" shape-rendering="crispEdges">'
        f'<rect width="{dim}" height="{dim}" fill="#fff"/>'
        f'<g fill="#000">{"".join(rects)}</g></svg>'
    )
