"""Point signs_ar.db at the Arabic clips shipped in data/signs_videos_ar/.

The DB was built on the original author's machine, so every video_path is an
absolute Windows path (c:\\Users\\...\\<word>_0.mp4) whose exact take number
(<word>_0) was never shipped. The clips we DO ship are other takes of the
same words (e.g. baby_49.mp4). This script rewrites each row's video_path to
the basename of the matching on-disk clip, found by the <word>_ prefix.

Idempotent: re-running converges to the same state; rows whose clip is
missing are left untouched and reported. scripts/migrate_to_postgres.py
(run on every deploy) then carries the basename into Postgres
sign.video_filename, and resolve_video_url only advertises clips that exist
on disk — so the dictionary's "Watch video" button appears exactly for the
words that have a shipped file.

Usage:
    python scripts/sync_arsl_video_paths.py [--dry-run]
"""
from __future__ import annotations

import argparse
import os
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "data", "signs_ar.db")
CLIPS_DIR = os.path.join(ROOT, "data", "signs_videos_ar")


def find_clip(word: str, files: list[str]) -> str | None:
    """The shipped take for a word: '<word>_<n>.mp4' (or exact '<word>.mp4')."""
    exact = f"{word}.mp4"
    if exact in files:
        return exact
    prefixed = sorted(f for f in files if f.startswith(f"{word}_"))
    return prefixed[0] if prefixed else None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(DB_PATH):
        print(f"missing {DB_PATH}")
        return 1
    files = sorted(os.listdir(CLIPS_DIR)) if os.path.isdir(CLIPS_DIR) else []
    print(f"{len(files)} clips in {CLIPS_DIR}")

    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT id, word, video_path FROM signs").fetchall()
    updated, unchanged, missing = [], [], []
    for row_id, word, video_path in rows:
        clip = find_clip((word or "").strip().lower(), files)
        if clip is None:
            missing.append(word)
            continue
        if video_path == clip:
            unchanged.append(word)
            continue
        updated.append((word, video_path, clip))
        if not args.dry_run:
            conn.execute("UPDATE signs SET video_path = ? WHERE id = ?", (clip, row_id))
    if not args.dry_run:
        conn.commit()
    conn.close()

    for word, old, new in updated:
        print(f"  {word}: {old!r} -> {new!r}")
    print(f"updated={len(updated)} already-correct={len(unchanged)} "
          f"no-clip-on-disk={missing or 0}")
    if missing:
        print("WORDS WITHOUT A SHIPPED CLIP:", ", ".join(missing))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
