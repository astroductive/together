"""Phone OTP verification via WhatsApp (WASender API — wasenderapi.com).

WASender is a plain WhatsApp message sender, not a "verify" service, so unlike
Twilio Verify we generate the one-time code ourselves, deliver it as a WhatsApp
message, and verify it locally. Used at signup.

Configuration (set as env vars / Render secrets):
    WASENDER_API_KEY   required — enables the feature (the device/session API
                       key from the WASender dashboard)
    WASENDER_API_URL   optional — default https://wasenderapi.com/api/send-message
    OTP_TTL_SECONDS    optional — code lifetime, default 300 (5 minutes)
    OTP_MESSAGE        optional — message template containing "{code}"

When WASENDER_API_KEY is unset, ``sms_enabled()`` returns False and signup
proceeds WITHOUT a code (so dev / an un-provisioned deploy still works).

The public interface (sms_enabled / send_code / check_code / normalize_phone)
is unchanged from the old Twilio module, so the routes and UI are untouched.

Codes are stored IN-MEMORY (sha256-hashed) with a TTL + a per-code attempt cap.
This assumes a single server process (the app runs one uvicorn worker); pending
codes are simply lost on restart, which is fine for a short-lived OTP. For a
multi-instance deploy, swap ``_store`` for Redis.
"""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import threading
import time

import requests

_DEFAULT_URL = "https://wasenderapi.com/api/send-message"
_DEFAULT_MSG = "Your Together verification code is {code}. It expires in 5 minutes."
_TIMEOUT = 15
_MAX_ATTEMPTS = 5

# phone -> {"hash": str, "expires": float, "attempts": int}
_store: dict[str, dict] = {}
_lock = threading.Lock()


def _key() -> str:
    return os.environ.get("WASENDER_API_KEY", "").strip()


def _url() -> str:
    return os.environ.get("WASENDER_API_URL", "").strip() or _DEFAULT_URL


def _ttl() -> int:
    try:
        return int(os.environ.get("OTP_TTL_SECONDS", "300"))
    except ValueError:
        return 300


def sms_enabled() -> bool:
    """True when WASender is configured (a single API key is enough)."""
    return bool(_key())


def normalize_phone(phone: str) -> str:
    """Trim spaces/dashes. WhatsApp/WASender expects an international number
    (E.164, e.g. +201234567890)."""
    return (phone or "").strip().replace(" ", "").replace("-", "")


def _hash(phone: str, code: str) -> str:
    return hashlib.sha256(f"{phone}:{code}".encode("utf-8")).hexdigest()


def _purge_locked(now: float) -> None:
    for p in [p for p, v in _store.items() if v["expires"] < now]:
        _store.pop(p, None)


def send_code(phone: str) -> dict:
    """Generate a code, remember it, and WhatsApp it. Returns {'ok','error'}."""
    if not _key():
        return {"ok": False, "error": "WhatsApp verification is not configured on the server."}

    code = f"{secrets.randbelow(1_000_000):06d}"
    now = time.time()
    with _lock:
        _purge_locked(now)
        _store[phone] = {"hash": _hash(phone, code), "expires": now + _ttl(), "attempts": 0}

    text = (os.environ.get("OTP_MESSAGE") or _DEFAULT_MSG).format(code=code)
    try:
        resp = requests.post(
            _url(),
            json={"to": phone, "text": text},
            headers={
                "Authorization": f"Bearer {_key()}",
                "Content-Type": "application/json",
            },
            timeout=_TIMEOUT,
        )
    except requests.RequestException as exc:
        with _lock:
            _store.pop(phone, None)
        return {"ok": False, "error": f"Could not reach the WhatsApp provider: {exc}"}

    if resp.status_code in (200, 201):
        return {"ok": True, "error": None}

    # Failed to send → drop the stored code so it can't be checked.
    with _lock:
        _store.pop(phone, None)
    message = ""
    try:
        message = (resp.json() or {}).get("message", "") or ""
    except Exception:
        pass
    return {"ok": False, "error": message or f"WhatsApp provider error ({resp.status_code})."}


def check_code(phone: str, code: str) -> dict:
    """Verify a submitted code locally. Returns {'approved','error'}."""
    if not _key():
        return {"approved": False, "error": "WhatsApp verification is not configured on the server."}

    code = (code or "").strip()
    now = time.time()
    with _lock:
        _purge_locked(now)
        entry = _store.get(phone)
        if not entry:
            return {"approved": False, "error": "No code was sent, or it expired. Request a new one."}
        if entry["attempts"] >= _MAX_ATTEMPTS:
            _store.pop(phone, None)
            return {"approved": False, "error": "Too many attempts. Request a new code."}
        entry["attempts"] += 1
        if hmac.compare_digest(entry["hash"], _hash(phone, code)):
            _store.pop(phone, None)  # one-time use
            return {"approved": True, "error": None}
        return {"approved": False, "error": "Invalid or expired code."}
