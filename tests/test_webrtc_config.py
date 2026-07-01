"""/api/webrtc-config: STUN fallback, Cloudflare TURN minting, credential cache.

Imports the full server module (torch/SBERT import chain), so it skips
gracefully in environments without the ML dependencies. PRELOAD_MODELS is
forced off so importing the app does not load models in a test run.
"""
import asyncio
import os
import sys

import pytest

os.environ.setdefault("PRELOAD_MODELS", "0")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app", "server"))

pytest.importorskip("torch", reason="server import chain needs torch")
main = pytest.importorskip("main", reason="full server module unavailable")


class _FakeResponse:
    def __init__(self, payload, status=200):
        self._payload = payload
        self.status_code = status

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def json(self):
        return self._payload


def _reset_cache():
    main._turn_cache["expires"] = 0.0
    main._turn_cache["ice_servers"] = None


def test_unconfigured_returns_stun_only(monkeypatch):
    monkeypatch.setattr(main, "_TURN_KEY_ID", "")
    monkeypatch.setattr(main, "_TURN_API_TOKEN", "")
    out = asyncio.run(main.webrtc_config(current_user={}))
    assert out["turn"] is False
    assert out["iceServers"] == main._STUN_FALLBACK


def test_mint_merges_turn_with_stun_and_caches(monkeypatch):
    _reset_cache()
    monkeypatch.setattr(main, "_TURN_KEY_ID", "key123")
    monkeypatch.setattr(main, "_TURN_API_TOKEN", "tok456")
    cf_server = {
        "urls": ["stun:stun.cloudflare.com:3478", "turn:turn.cloudflare.com:3478?transport=udp"],
        "username": "u", "credential": "c",
    }
    calls = []

    def fake_post(url, headers=None, json=None, timeout=None):
        calls.append(url)
        assert "key123" in url
        assert headers["Authorization"] == "Bearer tok456"
        return _FakeResponse({"iceServers": [cf_server]})

    monkeypatch.setattr(main.requests, "post", fake_post)

    out = asyncio.run(main.webrtc_config(current_user={}))
    assert out["turn"] is True
    assert cf_server in out["iceServers"]
    for stun in main._STUN_FALLBACK:  # STUN kept alongside TURN
        assert stun in out["iceServers"]

    # Second call is served from the cache — no new Cloudflare request.
    out2 = asyncio.run(main.webrtc_config(current_user={}))
    assert out2["iceServers"] == out["iceServers"]
    assert len(calls) == 1


def test_mint_failure_falls_back_to_stun(monkeypatch):
    _reset_cache()
    monkeypatch.setattr(main, "_TURN_KEY_ID", "key123")
    monkeypatch.setattr(main, "_TURN_API_TOKEN", "tok456")

    def fake_post(*a, **k):
        raise ConnectionError("cloudflare unreachable")

    monkeypatch.setattr(main.requests, "post", fake_post)
    out = asyncio.run(main.webrtc_config(current_user={}))
    assert out["turn"] is False
    assert out["iceServers"] == main._STUN_FALLBACK


def test_single_dict_response_normalized(monkeypatch):
    _reset_cache()
    monkeypatch.setattr(main, "_TURN_KEY_ID", "key123")
    monkeypatch.setattr(main, "_TURN_API_TOKEN", "tok456")
    cf_server = {"urls": "turn:turn.cloudflare.com:3478", "username": "u", "credential": "c"}
    monkeypatch.setattr(main.requests, "post",
                        lambda *a, **k: _FakeResponse({"iceServers": cf_server}))
    out = asyncio.run(main.webrtc_config(current_user={}))
    assert out["turn"] is True
    assert out["iceServers"][0] == cf_server
