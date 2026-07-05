"""QR encoder correctness — the meeting-link QR must actually scan.

The core pipeline (GF math, RS, format BCH, masking, placement) is validated
by round-tripping generated codes through OpenCV's decoder when available. If
OpenCV/numpy aren't installed the round-trip is skipped, but the deterministic
structural checks (finder patterns, size, format BCH) still run.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app", "server"))

import qr  # noqa: E402


def test_format_bch_matches_iso_table():
    # ISO 18004 Annex C reference strings for EC level M.
    known_m = {
        0: "101010000010010", 1: "101000100100101", 2: "101111001111100",
        3: "101101101001011", 4: "100010111111001", 5: "100000011001110",
        6: "100111110010111", 7: "100101010100000",
    }
    for mask, expected in known_m.items():
        got = format(qr._bch_format((0b00 << 3) | mask), "015b")
        assert got == expected, f"format M/{mask}: {got} != {expected}"


def test_reed_solomon_known_vector():
    # "HELLO WORLD" v1-M data codewords → EC codewords (Thonky reference).
    data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]
    assert qr._rs_encode(data, 10) == [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]


def test_finder_patterns_present():
    m = qr.generate_matrix("https://x.test/dashboard?room=ABCDE", "M")
    size = len(m)
    # three finder patterns: dark ring corners
    for (r, c) in [(0, 0), (0, size - 7), (size - 7, 0)]:
        assert m[r][c] == 1 and m[r + 6][c + 6] == 1
        assert m[r + 1][c + 1] == 0  # inner ring is light


def test_meeting_urls_round_trip_via_opencv():
    try:
        import numpy as np
        import cv2
    except Exception:
        import pytest
        pytest.skip("opencv/numpy not available for round-trip decode")

    def img_of(m, scale=10, quiet=4):
        size = len(m)
        dim = (size + quiet * 2) * scale
        a = np.full((dim, dim), 255, np.uint8)
        for r in range(size):
            for c in range(size):
                if m[r][c]:
                    a[(r + quiet) * scale:(r + quiet) * scale + scale,
                      (c + quiet) * scale:(c + quiet) * scale + scale] = 0
        return a

    det = cv2.QRCodeDetector()
    urls = [
        "https://together.onrender.com/dashboard?room=ABCDE",
        "https://astroductive.github.io/together/dashboard?room=QWERT",
        "http://localhost:8000/dashboard?room=ZXCVB",
        "معاً",
        "HELLO WORLD",
    ]
    for u in urls:
        decoded, _pts, _ = det.detectAndDecode(img_of(qr.generate_matrix(u, "M")))
        assert decoded == u, f"round-trip failed: {u!r} -> {decoded!r}"


def test_svg_is_well_formed():
    s = qr.svg("https://x.test/dashboard?room=ABCDE")
    assert s.startswith("<svg") and s.rstrip().endswith("</svg>")
    assert "<rect" in s
