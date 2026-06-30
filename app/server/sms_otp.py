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
import re
import secrets
import threading
import time

import requests

_DEFAULT_URL = "https://www.wasenderapi.com/api/send-message"
# Personalized + localized defaults. Both expose {name} and {code}. A custom
# OTP_MESSAGE env var (if set) overrides these for all languages.
_DEFAULT_MSG_EN = "Hi {name}, your Together verification code is {code}. It expires in 5 minutes."
_DEFAULT_MSG_AR = "مرحباً {name}، رمز التحقق الخاص بك في «معاً» هو {code}. ينتهي خلال 5 دقائق."
_NAME_FALLBACK_EN = "there"
_NAME_FALLBACK_AR = "صديقنا"
_TIMEOUT = 15
_MAX_ATTEMPTS = 5
# Minimum seconds between two sends to the SAME number — blocks WhatsApp spam /
# OTP-cost abuse even if the per-IP rate limiter is evaded (e.g. rotating IPs).
_DEFAULT_RESEND_COOLDOWN = 30

# phone -> {"hash": str, "expires": float, "attempts": int, "sent_at": float}
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


def _cooldown() -> int:
    # Read lazily + defensively so a malformed env value can't crash app import.
    try:
        return int(os.environ.get("OTP_RESEND_COOLDOWN", str(_DEFAULT_RESEND_COOLDOWN)))
    except ValueError:
        return _DEFAULT_RESEND_COOLDOWN


def sms_enabled() -> bool:
    """True when WASender is configured (a single API key is enough)."""
    return bool(_key())


def normalize_phone(phone: str) -> str:
    """Canonicalize a number to ONE E.164 form (``+<countrycode><number>``) so
    every spelling of the SAME line collides.

    Two users must not be able to register the same WhatsApp number by varying
    its formatting. We drop all separators/letters, collapse a leading
    international ``00`` prefix, and ALWAYS emit a single leading ``+``. So
    ``+201234567890``, ``20 123-456 7890`` (no plus) and ``0020123456 7890`` all
    map to the identical string ``+201234567890`` — the canonical value used
    everywhere: the in-memory OTP store key, the ``users.phone`` uniqueness
    check/column, and (via ``lstrip('+')``) the WASender recipient.

    Note: this does NOT validate the country code — a bare national number like
    ``01234567890`` becomes the (invalid) ``+01234567890``. The send-otp route
    enforces a real E.164 shape on top of this; the point here is purely that one
    physical number has exactly one canonical key."""
    digits = re.sub(r"\D", "", phone or "")  # drops spaces, dashes, dots, parens, '+'
    if not digits:
        return ""
    # 00<country><number> is the international-access spelling of +<country><number>.
    if digits.startswith("00"):
        digits = digits[2:]
    if not digits:
        return ""
    return "+" + digits


def _hash(phone: str, code: str) -> str:
    return hashlib.sha256(f"{phone}:{code}".encode("utf-8")).hexdigest()


def _purge_locked(now: float) -> None:
    for p in [p for p, v in _store.items() if v["expires"] < now]:
        _store.pop(p, None)


def send_code(phone: str, name: str | None = None, lang: str | None = None) -> dict:
    """Generate a random code, remember it, and WhatsApp a personalized message
    to the account holder. Returns {'ok','error'}."""
    if not _key():
        return {"ok": False, "error": "WhatsApp verification is not configured on the server."}

    code = f"{secrets.randbelow(1_000_000):06d}"
    now = time.time()
    with _lock:
        _purge_locked(now)
        cooldown = _cooldown()
        existing = _store.get(phone)
        if existing and (now - existing.get("sent_at", 0)) < cooldown:
            wait = int(cooldown - (now - existing["sent_at"])) + 1
            return {"ok": False, "error": f"Please wait {wait} seconds before requesting another code."}
        # Reserve the slot (and reset the attempt counter) before we send so a
        # concurrent request hits the cooldown instead of issuing a 2nd code.
        _store[phone] = {
            "hash": _hash(phone, code), "expires": now + _ttl(),
            "attempts": 0, "sent_at": now,
        }

    is_ar = (lang or "").strip().lower().startswith("ar")
    person = (name or "").strip() or (_NAME_FALLBACK_AR if is_ar else _NAME_FALLBACK_EN)
    template = os.environ.get("OTP_MESSAGE") or (_DEFAULT_MSG_AR if is_ar else _DEFAULT_MSG_EN)
    try:
        text = template.format(code=code, name=person)
    except (KeyError, IndexError):
        # A custom OTP_MESSAGE that doesn't use {name}/{code} placeholders.
        text = template.replace("{code}", code).replace("{name}", person)
    # WASender wants the recipient as digits-only with country code, no "+"
    # (their docs: "to": "212612345678"). We key our store by the +E.164 form.
    to = phone.lstrip("+")
    try:
        resp = requests.post(
            _url(),
            json={"to": to, "text": text},
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
