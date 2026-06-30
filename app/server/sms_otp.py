"""SMS one-time-passcode verification via Twilio Verify.

Server-side phone verification used at signup. We use Twilio Verify (not raw
Messaging) so Twilio owns code generation, expiry, retries and rate-limiting —
we just "start" and "check".

Configuration (all three required to enable; set as env vars / Render secrets):
    TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN
    TWILIO_VERIFY_SERVICE_SID

When they are not set, ``sms_enabled()`` returns False and signup proceeds
WITHOUT phone verification (so local dev / an un-provisioned deploy still works).
Once configured, signup enforces a valid code.

No SDK dependency — this talks to the Twilio REST API with ``requests``.
"""
from __future__ import annotations

import os

import requests

_VERIFY_BASE = "https://verify.twilio.com/v2/Services"
_TIMEOUT = 15


def _cfg() -> tuple[str, str, str]:
    return (
        os.environ.get("TWILIO_ACCOUNT_SID", "").strip(),
        os.environ.get("TWILIO_AUTH_TOKEN", "").strip(),
        os.environ.get("TWILIO_VERIFY_SERVICE_SID", "").strip(),
    )


def sms_enabled() -> bool:
    """True only when all three Twilio Verify credentials are present."""
    sid, token, service = _cfg()
    return bool(sid and token and service)


def normalize_phone(phone: str) -> str:
    """Trim spaces/dashes. Twilio Verify expects E.164 (e.g. +201234567890);
    we don't fabricate a country code — the UI asks the user for the full
    international number and Twilio rejects anything malformed."""
    return (phone or "").strip().replace(" ", "").replace("-", "")


def _twilio_message(resp: requests.Response) -> str:
    try:
        return (resp.json() or {}).get("message", "") or ""
    except Exception:
        return ""


def send_code(phone: str) -> dict:
    """Start an SMS verification. Returns {'ok': bool, 'error': str|None}."""
    sid, token, service = _cfg()
    if not (sid and token and service):
        return {"ok": False, "error": "SMS verification is not configured on the server."}
    url = f"{_VERIFY_BASE}/{service}/Verifications"
    try:
        resp = requests.post(
            url, data={"To": phone, "Channel": "sms"}, auth=(sid, token), timeout=_TIMEOUT
        )
    except requests.RequestException as exc:
        return {"ok": False, "error": f"Could not reach the SMS provider: {exc}"}
    if resp.status_code in (200, 201):
        return {"ok": True, "error": None}
    return {"ok": False, "error": _twilio_message(resp) or f"SMS provider error ({resp.status_code})."}


def check_code(phone: str, code: str) -> dict:
    """Check a submitted code. Returns {'approved': bool, 'error': str|None}."""
    sid, token, service = _cfg()
    if not (sid and token and service):
        return {"approved": False, "error": "SMS verification is not configured on the server."}
    url = f"{_VERIFY_BASE}/{service}/VerificationCheck"
    try:
        resp = requests.post(
            url, data={"To": phone, "Code": code}, auth=(sid, token), timeout=_TIMEOUT
        )
    except requests.RequestException as exc:
        return {"approved": False, "error": f"Could not reach the SMS provider: {exc}"}
    if resp.status_code in (200, 201):
        try:
            approved = (resp.json() or {}).get("status") == "approved"
        except Exception:
            approved = False
        return {"approved": approved, "error": None if approved else "Invalid or expired code."}
    # 404 here usually means the code already expired / was consumed.
    return {"approved": False, "error": _twilio_message(resp) or "Invalid or expired code."}
