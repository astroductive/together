"""Sign-video resolution: the repo ships the English clips, so path lookup is
fully testable offline. Guards the BASE_DIR-vs-repo-root regression that made
every /api/videos/{filename} 404 (the video dirs live at the repo root, not
under app/).
"""
import os
import sys

import pytest

os.environ.setdefault("PRELOAD_MODELS", "0")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app", "server"))

pytest.importorskip("torch", reason="server import chain needs torch")
main = pytest.importorskip("main", reason="full server module unavailable")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_video_dirs_point_at_shipped_folders():
    existing = [d for d in main._VIDEO_DIRS if os.path.isdir(d)]
    assert existing, f"no _VIDEO_DIRS exists on disk: {main._VIDEO_DIRS}"
    assert os.path.join(REPO_ROOT, "data", "signs_videos") in existing


def test_english_clip_resolves():
    # TV.mp4 is committed in data/signs_videos.
    path = main._find_video_path("TV.mp4")
    assert path and os.path.isfile(path)


def test_windows_style_db_path_resolves_to_basename():
    # The sign DBs store Windows paths; resolution must survive backslashes.
    path = main._find_video_path("signs_videos\\TV.mp4")
    assert path and path.endswith("TV.mp4")


def test_missing_video_returns_none():
    assert main._find_video_path("definitely-not-a-clip.mp4") is None
    assert main._find_video_path("") is None


def test_arabic_clips_resolve_if_shipped():
    ar_dir = os.path.join(REPO_ROOT, "data", "signs_videos_ar")
    if not os.path.isdir(ar_dir):
        pytest.skip("Arabic clips not shipped in this checkout")
    for name in os.listdir(ar_dir):
        path = main._find_video_path(name)
        assert path and os.path.isfile(path), f"{name} did not resolve"
