import os as _os

# ── Crash prevention — MUST be before ANY other imports ──
# On Windows under uvicorn, the `multiprocess` package (used by
# HuggingFace datasets/sentence-transformers) starts a ResourceTracker
# subprocess.  Its __del__ destructor calls _stop() during GC, which
# kills the parent uvicorn process with a silent exit(1).
# Monkey-patching __del__ to a no-op prevents this.
_os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
_os.environ["OMP_NUM_THREADS"] = "1"
_os.environ["MKL_NUM_THREADS"] = "1"
_os.environ["OPENBLAS_NUM_THREADS"] = "1"
_os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    import multiprocess.resource_tracker as _mrt
    _mrt.ResourceTracker.__del__ = lambda self: None
except Exception:
    pass

# Force torch to grab OpenMP first, with 1 thread to avoid contention.
import torch as _torch
_torch.set_num_threads(1)

# Pre-import sentence_transformers BEFORE other libraries (SQLAlchemy,
# socketio, etc.) to avoid a silent exit(1) crash on Windows caused by
# import-order-dependent DLL conflicts.
import sentence_transformers as _st  # noqa: F401

import sys
import mimetypes

# Fix MIME type for .js files on Windows
mimetypes.init()
mimetypes.add_type('application/javascript', '.js', True)
mimetypes.add_type('application/javascript', '.mjs', True)

# Ensure this directory is on the path for sibling module imports
_HERE = _os.path.dirname(_os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import socketio
import os
import uvicorn
from email_validator import EmailNotValidError, validate_email
from threading import Lock, Thread
import time
import re

import base64
import requests

# ── Provider abstraction (LLM / TTS / STT) ────────────────────
# Concrete vendor calls live behind the providers package. Gemini is the
# default for all three; offline fallbacks (Ollama / pyttsx3 / Whisper) kick
# in automatically when a cloud key is missing or a call fails. See
# providers/__init__.py and .env.example.
from providers import (
    ProviderError,
    get_llm_provider,
    get_tts_provider,
    get_stt_provider,
)


def call_gemini_llm(prompt: str, temperature: float = 0.0) -> str:
    """Backwards-compatible name: now routes through the configured LLM provider chain."""
    try:
        return get_llm_provider().generate(prompt, temperature)
    except ProviderError as e:
        print(f"[LLM Error] {e}")
        return ""


def call_gemini_tts(text: str, language: str = "arabic", voice: str | None = None) -> bytes:
    """Backwards-compatible name: routes through the configured TTS provider chain."""
    return get_tts_provider().synthesize(text, language, voice)


def call_gemini_stt(audio_bytes: bytes, mime_type: str = "audio/wav", language: str = "arabic") -> str:
    """Backwards-compatible name: routes through the configured STT provider chain."""
    try:
        return get_stt_provider().transcribe(audio_bytes, mime_type, language)
    except ProviderError as e:
        print(f"[STT Error] {e}")
        return ""


SLOW_REQUEST_MS = float(os.environ.get("SLOW_REQUEST_MS", "5000"))

# ── Local modules ─────────────────────────────────────────────
from database import engine, Base, User, get_db, init_db
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_password_hash,
    needs_rehash,
    require_api_rate_limit,
    require_auth_rate_limit,
    rotate_refresh_token,
    verify_password,
)
from schemas import UserCreate, UserResponse, Token, TokenRefresh, UserUpdate, OtpSendRequest
from sms_otp import sms_enabled, send_code, check_code, normalize_phone
from sign_labels import ar_label as _ar_label, CATEGORY_AR as _CATEGORY_AR
from asl_service import ASLService, SignDB, ArabicSignDB

# Offload blocking ML/LLM/network calls off the event loop so concurrent
# requests aren't serialized behind one inference (see Phase 5 / LATENCY.md).
from starlette.concurrency import run_in_threadpool
import profiling
from profiling import Timer

# ── App setup ─────────────────────────────────────────────────
app = FastAPI(title="Together — Sign Language AI Platform", version="2.0.0")


@app.on_event("startup")
def _ensure_database_ready():
    """Idempotently ensure the pgvector extension + tables exist.

    Production deployments run `alembic upgrade head` first (the start scripts /
    docker-compose do this); this is a harmless no-op when the schema already
    exists, and keeps a fresh dev database bootable. Failure here must not crash
    boot — the lazy model loaders surface DB problems via /api/health.
    """
    try:
        init_db()
    except Exception as e:
        print(f"[startup] init_db skipped: {e}")


@app.on_event("startup")
def _warm_models_on_boot():
    """Pre-load the recognition models at boot instead of lazily on first request.

    On a warm (paid / always-on) instance this moves the one-time 500–1000 ms
    model-load cost off the user's first translation and onto server boot, so the
    first sign someone signs is fast. Runs in a background thread so it never
    delays port binding / the health check (important for the platform's
    "service is live" probe). Controlled by PRELOAD_MODELS (default on); set to
    "0" to keep the old lazy behaviour (e.g. to speed cold boots on free tier
    where the process may be torn down again before traffic arrives).
    """
    if os.getenv("PRELOAD_MODELS", "1") != "1":
        return

    Thread(target=_warm_engines, name="model-warmup", daemon=True).start()


# True once both engines have had a real forward pass (XNNPACK / torch kernels
# JIT-compiled). The frontend pre-warm path checks this so the dummy inference
# runs at most once per process, not on every ?warm=1 request.
_models_warmed = False
_warm_lock = Lock()


def _warm_engines():
    """Load both recognition engines AND run one dummy forward pass each.

    Loading alone does not trigger TFLite's XNNPACK JIT kernel compilation or
    torch's first-use operator tracing — those happen on the first invoke(),
    costing the user a hidden ~200-400ms (TFLite) / longer (torch) on their very
    first sign. A single dummy pass moves that cost off the user's timeline.

    Idempotent and serialized: safe to call from the boot thread and from the
    frontend pre-warm request concurrently; the heavy pass runs at most once.
    """
    global _models_warmed
    import time as _t
    import numpy as _np

    with _warm_lock:
        if _models_warmed:
            return

        # 1. ASL TFLite engine — load + one dummy inference (warms XNNPACK).
        try:
            t0 = _t.perf_counter()
            asl = get_asl_engine()
            if asl is not None:
                dummy = _np.zeros((1, 60, 543, 3), dtype=_np.float32)
                asl.predict_sign([dummy[0]])
            print(f"[warm] ASL engine ready in {(_t.perf_counter()-t0)*1000:.0f} ms")
        except Exception as e:
            print(f"[warm] ASL engine warm-up skipped: {e}")

        # 2. Arabic PyTorch engine — load + one dummy inference (warms torch kernels).
        try:
            t0 = _t.perf_counter()
            ar = get_arabic_engine()
            if ar is not None:
                # The dummy MUST contain non-zero hand landmarks: an all-zeros
                # frame is rejected by the hand-presence gate in
                # predict_sign_from_landmarks BEFORE any torch forward pass
                # (verified: 0 model calls on zeros, 1 on this), which made the
                # warm-up a no-op and left the first real Arabic user paying
                # the first-inference cost.
                dummy_lm = [[[0.5, 0.5, 0.0]] * 59] * 10   # 10 frames × 59 landmarks
                ar.predict_sign_from_landmarks(dummy_lm, 640, 480)
            print(f"[warm] Arabic engine ready in {(_t.perf_counter()-t0)*1000:.0f} ms")
        except Exception as e:
            print(f"[warm] Arabic engine warm-up skipped: {e}")

        _models_warmed = True


def normalize_and_validate_email(raw_email: str, *, check_deliverability: bool = False) -> str:
    email = validate_email(raw_email, check_deliverability=check_deliverability).normalized
    return email

# ── Global error handler (always returns JSON, never raw HTML) ─
from fastapi import Request as _Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
async def generic_exception_handler(request: _Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: _Request, exc: RequestValidationError):
    errors = exc.errors()
    detail = "; ".join(f"{e['loc'][-1]}: {e['msg']}" for e in errors)
    return JSONResponse(status_code=422, content={"detail": detail})

# ── CORS ──────────────────────────────────────────────────────
# allow_origins=["*"] is spec-invalid with allow_credentials=True.
# Default to localhost origins; override via ALLOWED_ORIGINS env var
# (comma-separated list, e.g. "https://example.com,https://www.example.com").
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000")
_cors_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# The same list gates Socket.IO handshakes (engine.io rejects any other
# Origin with HTTP 400 "not an accepted origin"), so a deploy where
# ALLOWED_ORIGINS was never set silently loses ALL socket traffic — live
# streaming and meeting signaling — while plain HTTP keeps working. Render
# injects its public URL as RENDER_EXTERNAL_URL; include it automatically so
# the app accepts its own origin without manual configuration.
_render_url = (os.environ.get("RENDER_EXTERNAL_URL") or "").strip().rstrip("/")
if _render_url and _render_url not in _cors_origins:
    _cors_origins.append(_render_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compress non-trivial responses to reduce transfer time on slower networks.
app.add_middleware(GZipMiddleware, minimum_size=1024)

# ── MIME Fix (Windows) ──────────────────────────────────────────
import mimetypes
mimetypes.init()
mimetypes.add_type('application/javascript', '.js', True)

class ForceJSMimeMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # We only want to process HTTP requests. If it's a websocket (e.g. Socket.IO upgrade), pass through directly.
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "").lower()
        started = time.perf_counter()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])

                # Check for X-Process-Time-ms (calculate when response starts)
                elapsed_ms = (time.perf_counter() - started) * 1000.0
                headers.append((b"x-process-time-ms", f"{elapsed_ms:.1f}".encode("latin1")))

                # Security headers
                headers.append((b"x-frame-options", b"DENY"))
                headers.append((b"x-content-type-options", b"nosniff"))
                headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                headers.append((b"permissions-policy", b"camera=(self), microphone=(self), geolocation=()"))

                # Check if it is a .js file
                if path.endswith(".js"):
                    # Remove any existing Content-Type header
                    headers[:] = [h for h in headers if h[0].lower() != b"content-type"]
                    headers.append((b"content-type", b"application/javascript"))

                # Cache versioned/static assets aggressively for faster repeat page loads.
                if path.startswith("/static/"):
                    headers[:] = [h for h in headers if h[0].lower() != b"cache-control"]
                    headers.append((b"cache-control", b"public, max-age=86400"))
            
            await send(message)

        await self.app(scope, receive, send_wrapper)

app.add_middleware(ForceJSMimeMiddleware)

# ── Static files & Templates ──────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# ── Socket.IO ─────────────────────────────────────────────────
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=_cors_origins)
socket_app = socketio.ASGIApp(sio, app)

# ── Deferred model loading ────────────────────────────────────
# All heavy models (SBERT, TFLite, PyTorch) are loaded lazily on
# first use instead of at module-import time.  This avoids the
# silent OpenMP / libiomp5md.dll double-init crash that happens
# on Windows when PyTorch + SBERT are loaded during uvicorn's
# module-import phase.
# ──────────────────────────────────────────────────────────────

_sign_db = None
_sign_db_error = None
_sign_db_last_error_time = 0
_sign_db_lock = Lock()

def get_sign_db():
    global _sign_db, _sign_db_error, _sign_db_last_error_time
    if _sign_db is not None:
        return _sign_db
    
    now = time.time()
    if _sign_db_error is not None:
        if now - _sign_db_last_error_time > 5:
            print("[SignDB] Clearing previous init error to retry...")
            _sign_db_error = None
        else:
            return None

    with _sign_db_lock:
        if _sign_db is not None:
            return _sign_db
        if _sign_db_error is not None:
            return None
        try:
            print("[Lazy] Initializing SignDB...")
            _sign_db = SignDB()
            return _sign_db
        except Exception as e:
            _sign_db_error = str(e)
            _sign_db_last_error_time = now
            print(f"[ERROR] SignDB init failed: {e}")
            return None

# ── Lazy ASL inference engine (for Sign-to-Text & Sign-to-Speech) ──
_asl_engine = None
_asl_engine_error = None
_asl_engine_retry_count = 0
_asl_engine_last_error_time = None
_asl_engine_lock = Lock()

def get_asl_engine():
    """
    Lazy-load ASL engine with retry logic.
    Retries on failure with exponential backoff to handle transient issues.
    """
    global _asl_engine, _asl_engine_error, _asl_engine_retry_count, _asl_engine_last_error_time
    import time as _time_module
    
    # If engine is already loaded, return it
    if _asl_engine is not None:
        return _asl_engine
    
    # If error occurred, check if we should retry (exponential backoff)
    if _asl_engine_error is not None:
        now = _time_module.time()
        retry_delay = min(2 ** _asl_engine_retry_count, 300)  # Cap at 5 minutes
        
        # Don't retry too frequently
        if _asl_engine_last_error_time is not None and (now - _asl_engine_last_error_time) < retry_delay:
            return None
        
        # Time to retry - reset and try again
        print(f"[ASLService] Retrying initialization (attempt {_asl_engine_retry_count + 1})...")
        _asl_engine_error = None
        _asl_engine_retry_count += 1
    
    # Try to initialize (guarded so concurrent requests don't trigger duplicate heavy loads)
    with _asl_engine_lock:
        if _asl_engine is not None:
            return _asl_engine
        if _asl_engine_error is not None:
            return None

        try:
            sign_db = get_sign_db()
            _asl_engine = ASLService(sign_db=sign_db)
            _asl_engine_retry_count = 0  # Reset retry count on success
            print("[ASLService] Successfully initialized.")
            return _asl_engine
        except Exception as e:
            _asl_engine_error = str(e)
            _asl_engine_last_error_time = _time_module.time()
            print(f"[ERROR] ASLService init failed (attempt {_asl_engine_retry_count}): {e}")
            return None

# ── Lazy Arabic Sign DB (separate from English signs.db) ──
_arabic_sign_db = None
_arabic_sign_db_error = None
_arabic_sign_db_last_error_time = 0
_arabic_sign_db_lock = Lock()

def get_arabic_sign_db():
    global _arabic_sign_db, _arabic_sign_db_error, _arabic_sign_db_last_error_time
    if _arabic_sign_db is not None:
        return _arabic_sign_db
    
    now = time.time()
    if _arabic_sign_db_error is not None:
        if now - _arabic_sign_db_last_error_time > 5:
            print("[ArabicSignDB] Clearing previous init error to retry...")
            _arabic_sign_db_error = None
        else:
            return None

    with _arabic_sign_db_lock:
        if _arabic_sign_db is not None:
            return _arabic_sign_db
        if _arabic_sign_db_error is not None:
            return None
        try:
            print("[Lazy] Initializing ArabicSignDB...")
            # Reuse SBERT from SignDB if available
            sign_db = get_sign_db()
            if sign_db is not None:
                _arabic_sign_db = ArabicSignDB(sbert_model=sign_db.model, sbert_util=sign_db.util)
            else:
                _arabic_sign_db = ArabicSignDB()
            return _arabic_sign_db
        except Exception as e:
            _arabic_sign_db_error = str(e)
            _arabic_sign_db_last_error_time = now
            print(f"[ERROR] ArabicSignDB init failed: {e}")
            return None

# ── Lazy Arabic inference engine (PyTorch) ──
_arabic_engine = None
_arabic_engine_error = None
_arabic_engine_last_error_time = 0
_arabic_engine_lock = Lock()

def get_arabic_engine():
    global _arabic_engine, _arabic_engine_error, _arabic_engine_last_error_time
    if _arabic_engine is not None:
        return _arabic_engine
    
    now = time.time()
    if _arabic_engine_error is not None:
        if now - _arabic_engine_last_error_time > 5:
            print("[ArabicPredictor] Clearing previous init error to retry...")
            _arabic_engine_error = None
        else:
            return None

    with _arabic_engine_lock:
        if _arabic_engine is not None:
            return _arabic_engine
        if _arabic_engine_error is not None:
            return None
        try:
            print("[Lazy] Initializing Arabic model...")
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            if root_dir not in sys.path:
                sys.path.insert(0, root_dir)
            model_path = os.path.join(root_dir, "models", "best_model.pth")
            class_mapping_path = os.path.join(root_dir, "models", "class_mapping.json")
            from models.sign_predictor import SignLanguagePredictor
            _arabic_engine = SignLanguagePredictor(
                model_path=model_path,
                class_mapping_path=class_mapping_path
            )
            print("[ArabicPredictor] Successfully initialized Arabic model.")
            return _arabic_engine
        except Exception as e:
            _arabic_engine_error = str(e)
            _arabic_engine_last_error_time = now
            print(f"[ERROR] ArabicPredictor init failed: {e}")
            return None

# NOTE: Offline pyttsx3 Arabic TTS now lives in providers/local.py (Pyttsx3TTS)
# and is reached automatically via the TTS provider fallback chain.


@app.get("/api/health")
async def health(warm: bool = False):
    """Quick status check.

    By default this endpoint is non-blocking and does not initialize heavy AI models.
    Pass ?warm=1 to trigger lazy initialization in the background request path.
    """
    global _sign_db, _sign_db_error, _asl_engine, _asl_engine_error, _arabic_engine, _arabic_engine_error

    if warm:
        get_sign_db()
        # Load AND run a one-time dummy forward pass so XNNPACK / torch kernels are
        # JIT-compiled here (off the user's camera timeline) rather than on their
        # first real sign. Runs in the threadpool so we don't block the event loop;
        # _warm_engines is idempotent so concurrent boot/pre-warm calls are safe.
        await run_in_threadpool(_warm_engines)

    db_status = "ok" if _sign_db is not None else ("error" if _sign_db_error else "not_loaded")
    engine_status = "ok" if _asl_engine is not None else ("error" if _asl_engine_error else "not_loaded")
    arabic_status = "ok" if _arabic_engine is not None else ("error" if _arabic_engine_error else "not_loaded")
    has_error = bool(_sign_db_error or _asl_engine_error or _arabic_engine_error)
    models_ready = db_status == "ok" and engine_status == "ok" and arabic_status == "ok"

    return {
        # Keep /api/health fast by default: lazy, not-yet-loaded models are healthy but not warmed.
        "status": "degraded" if has_error else "ok",
        "models_ready": models_ready,
        "db_status": db_status,
        "engine_status": engine_status,
        "arabic_status": arabic_status,
        "signs_loaded": len(_sign_db.words) if _sign_db is not None else 0,
        "model_signs_loaded": len(_asl_engine.words) if _asl_engine is not None else 0,
        "arabic_signs_loaded": len(_arabic_engine.labels) if _arabic_engine is not None else 0,
        "error": _asl_engine_error or _sign_db_error or _arabic_engine_error or None,
        # Configured provider chains (no network probe here — just the resolved order).
        "providers": {
            "llm": get_llm_provider().chain_names,
            "tts": get_tts_provider().chain_names,
            "stt": get_stt_provider().chain_names,
        },
    }


# ═══════════════════════════════════════════════════════════════
# PAGE ROUTES
# ═══════════════════════════════════════════════════════════════

# ── UI language resolution ────────────────────────────────────
# Language precedence: explicit ?lang= query param → 'lang' cookie → 'en'.
# When an explicit, valid ?lang= is supplied we persist it as a long-lived
# cookie so subsequent param-less navigation (plain links like /about) stays
# in the chosen language. Each localized route picks `<name>_ar.html` when the
# language is Arabic and that template exists, else falls back to the English
# template — so missing _ar variants degrade gracefully instead of 500ing.
SUPPORTED_LANGS = ("en", "ar")
LANG_COOKIE = "lang"
_TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")


def _localized_page(request: Request, base_name: str, lang: str | None):
    """Render base_name (en) or its _ar.html sibling based on resolved language.

    base_name is given without extension, e.g. 'about' or 'products/handscript'.
    Falls back to the English template if the Arabic variant is missing.
    """
    chosen = (lang or "").strip().lower()
    persist = chosen in SUPPORTED_LANGS
    if not persist:
        chosen = (request.cookies.get(LANG_COOKIE) or "en").strip().lower()
        if chosen not in SUPPORTED_LANGS:
            chosen = "en"

    template_name = f"{base_name}.html"
    if chosen == "ar":
        ar_name = f"{base_name}_ar.html"
        if os.path.exists(os.path.join(_TEMPLATES_DIR, ar_name)):
            template_name = ar_name

    # Defensive: a missing template should 404 cleanly rather than raise a 500.
    if not os.path.exists(os.path.join(_TEMPLATES_DIR, template_name)):
        raise HTTPException(status_code=404, detail="Page not found.")

    resp = templates.TemplateResponse(request, template_name)
    if persist:
        resp.set_cookie(
            LANG_COOKIE, chosen,
            max_age=60 * 60 * 24 * 365, samesite="lax", path="/",
        )
    return resp


@app.get("/", response_class=HTMLResponse)
async def home(request: Request, lang: str | None = None):
    return _localized_page(request, "landing", lang)

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request, lang: str | None = None):
    return _localized_page(request, "index", lang)

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, lang: str | None = None):
    return _localized_page(request, "login", lang)

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request, lang: str | None = None):
    return _localized_page(request, "signup", lang)

@app.get("/products/handscript", response_class=HTMLResponse)
async def page_handscript(request: Request, lang: str | None = None):
    return _localized_page(request, "products/handscript", lang)

@app.get("/products/voicebridge", response_class=HTMLResponse)
async def page_voicebridge(request: Request, lang: str | None = None):
    return _localized_page(request, "products/voicebridge", lang)

@app.get("/products/signtype", response_class=HTMLResponse)
async def page_signtype(request: Request, lang: str | None = None):
    return _localized_page(request, "products/signtype", lang)

@app.get("/products/talkside", response_class=HTMLResponse)
async def page_talkside(request: Request, lang: str | None = None):
    return _localized_page(request, "products/talkside", lang)

@app.get("/products/signline", response_class=HTMLResponse)
async def page_signline(request: Request, lang: str | None = None):
    return _localized_page(request, "products/signline", lang)

@app.get("/languages/asl", response_class=HTMLResponse)
async def page_asl(request: Request, lang: str | None = None):
    return _localized_page(request, "languages/asl", lang)

@app.get("/languages/arsl", response_class=HTMLResponse)
async def page_arsl(request: Request, lang: str | None = None):
    return _localized_page(request, "languages/arsl", lang)

@app.get("/resources", response_class=HTMLResponse)
async def page_resources(request: Request, lang: str | None = None):
    return _localized_page(request, "resources", lang)

@app.get("/about", response_class=HTMLResponse)
async def page_about(request: Request, lang: str | None = None):
    return _localized_page(request, "about", lang)

@app.get("/partnership", response_class=HTMLResponse)
async def page_partnership(request: Request, lang: str | None = None):
    return _localized_page(request, "partnership", lang)

@app.get("/contact", response_class=HTMLResponse)
async def page_contact(request: Request, lang: str | None = None):
    return _localized_page(request, "contact", lang)

@app.get("/demo", response_class=HTMLResponse)
async def page_demo(request: Request, lang: str | None = None):
    return _localized_page(request, "demo", lang)

@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request, lang: str | None = None):
    # Auth is enforced client-side (requireAuth) like the dashboard; the page
    # itself is just the shell and fetches /api/auth/me with the bearer token.
    return _localized_page(request, "profile", lang)

@app.get("/dictionary", response_class=HTMLResponse)
async def dictionary_page(request: Request, lang: str | None = None):
    return _localized_page(request, "dictionary", lang)

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request, lang: str | None = None):
    return _localized_page(request, "analytics", lang)

@app.get("/practice", response_class=HTMLResponse)
async def practice_page(request: Request, lang: str | None = None):
    return _localized_page(request, "practice", lang)


# ═══════════════════════════════════════════════════════════════
# AUTH API
# ═══════════════════════════════════════════════════════════════

@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
async def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_auth_rate_limit),
):
    raw_email = str(user_data.email).strip().lower()
    password = (user_data.password or "").strip()
    full_name = (user_data.full_name or "").strip() or None
    role = (user_data.role or "Speaker").strip() or "Speaker"

    try:
        email = normalize_and_validate_email(raw_email, check_deliverability=True)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a real email address that can receive mail."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    # Normalize the phone up-front so the duplicate check, the OTP store key,
    # and the stored value are all the same canonical form.
    phone = normalize_phone(user_data.phone or "") or None

    # Check for duplicate email
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # One account per phone number. Checked here for a friendly message BEFORE
    # we consume the OTP; the DB unique constraint (see migration 0003) is the
    # race-proof backstop, enforced again at commit below.
    if phone:
        existing_phone = db.query(User).filter(User.phone == phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists.",
            )

    # ── SMS phone verification (enforced only when WhatsApp/WASender is set up) ──
    phone_verified = False
    if sms_enabled():
        if not phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A phone number is required.",
            )
        code = (user_data.code or "").strip()
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enter the WhatsApp verification code sent to your phone.",
            )
        result = check_code(phone, code)
        if not result["approved"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"] or "Invalid or expired verification code.",
            )
        phone_verified = True

    hashed = get_password_hash(password)
    new_user = User(
        full_name=full_name,
        email=email,
        hashed_password=hashed,
        role=role,
        phone=phone,
        phone_verified=phone_verified,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        # A concurrent signup claimed the same email or phone between our check
        # and this commit — the unique constraints make the second one lose.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email or phone number already exists.",
        )
    db.refresh(new_user)
    return new_user


@app.get("/api/auth/sms-status")
async def sms_status():
    """Lets the signup UI know whether to require phone verification."""
    return {"sms_enabled": sms_enabled()}


@app.post("/api/auth/send-otp")
async def send_otp(
    body: OtpSendRequest,
    db: Session = Depends(get_db),
    _: None = Depends(require_auth_rate_limit),
):
    """Send a WhatsApp verification code to a phone number (WASender)."""
    if not sms_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WhatsApp verification is not configured on the server.",
        )
    phone = normalize_phone(body.phone or "")
    # Require a real E.164 number: '+', a non-zero country code, 7–15 digits.
    # normalize_phone canonicalizes formatting; this rejects national/garbage input.
    if not re.fullmatch(r"\+[1-9]\d{6,14}", phone or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter your phone in international format, e.g. +201234567890.",
        )
    # One account per phone: don't send a fresh signup code to a number that is
    # already registered (and don't waste a WhatsApp send on it).
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this phone number already exists. Please log in instead.",
        )
    # The WhatsApp send is a blocking HTTP call — keep it off the event loop.
    name = (body.name or "").strip()[:60] or None
    result = await run_in_threadpool(send_code, phone, name, body.lang)
    if not result["ok"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"] or "Could not send the verification code.",
        )
    return {"sent": True}


@app.post("/api/auth/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    _: None = Depends(require_auth_rate_limit),
):
    from fastapi.responses import JSONResponse as _JSONResponse
    raw_email = (form_data.username or "").strip().lower()
    password = (form_data.password or "")

    try:
        email = normalize_and_validate_email(raw_email, check_deliverability=False)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address.",
        )

    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Transparently upgrade legacy bcrypt hashes to Argon2id on successful login.
    if needs_rehash(user.hashed_password):
        user.hashed_password = get_password_hash(password)

    access_token = create_access_token(data={
        "sub":       user.email,
        "full_name": user.full_name or "",
        "role":      user.role,
        "user_id":   user.id,
    })

    _, refresh_signed = create_refresh_token(user.id, db)
    db.commit()

    # Deliver the access token in the JSON body (browser stores in localStorage).
    # The refresh token goes in a httpOnly, SameSite=Lax cookie so JS cannot read it,
    # which prevents XSS from stealing the refresh credential.
    is_secure = request.url.scheme == "https"
    response = _JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_signed,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth/refresh",
    )
    return response


@app.post("/api/auth/refresh", response_model=TokenRefresh)
async def refresh_token_endpoint(
    request: Request,
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh-token cookie for a fresh access token.

    The old refresh token is revoked on every use (rotation), limiting the
    blast radius of a stolen token to a single request window.
    """
    from fastapi.responses import JSONResponse as _JSONResponse
    raw_rt = request.cookies.get("refresh_token")
    if not raw_rt:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token cookie.")

    user_id, new_refresh_signed = rotate_refresh_token(raw_rt, db)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    db.commit()

    new_access = create_access_token(data={
        "sub":       user.email,
        "full_name": user.full_name or "",
        "role":      user.role,
        "user_id":   user.id,
    })

    is_secure = request.url.scheme == "https"
    response = _JSONResponse(content={
        "access_token": new_access,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    })
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_signed,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth/refresh",
    )
    return response


@app.post("/api/auth/logout")
async def logout(
    request: Request,
    db: Session = Depends(get_db),
):
    """Revoke the refresh token and clear the cookie."""
    from fastapi.responses import JSONResponse as _JSONResponse
    raw_rt = request.cookies.get("refresh_token")
    if raw_rt:
        try:
            from jose import jwt as _jose_jwt
            from auth import SECRET_KEY as _SK, ALGORITHM as _ALG
            payload = _jose_jwt.decode(raw_rt, _SK, algorithms=[_ALG])
            jti = payload.get("jti")
            if jti:
                from db.repository import RefreshTokenRepository
                RefreshTokenRepository(db).revoke(jti)
                db.commit()
        except Exception:
            pass  # Expired / malformed tokens are fine — cookie will be cleared anyway

    response = _JSONResponse(content={"detail": "Logged out."})
    response.delete_cookie(key="refresh_token", path="/api/auth/refresh")
    return response


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the authenticated user's profile."""
    user = db.query(User).filter(User.email == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.patch("/api/auth/me")
async def update_me(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's profile (name, role, password).

    Returns the updated profile plus a freshly minted access token so the
    client's JWT (which carries full_name/role) reflects the change immediately.
    """
    user = db.query(User).filter(User.email == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip() or None

    if payload.role is not None:
        role = payload.role.strip()
        if role:
            user.role = role

    # Password change requires verifying the current password.
    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enter your current password to set a new one.",
            )
        if not verify_password(payload.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        if len(payload.new_password.strip()) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long.",
            )
        user.hashed_password = get_password_hash(payload.new_password.strip())

    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={
        "sub":       user.email,
        "full_name": user.full_name or "",
        "role":      user.role,
        "user_id":   user.id,
    })

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
        "access_token": access_token,
        "token_type": "bearer",
    }


# ═══════════════════════════════════════════════════════════════
# ASL ENGINE API
# ═══════════════════════════════════════════════════════════════

from pydantic import BaseModel as _BaseModel
from typing import List as _List, Optional as _Optional

class TranslateRequest(_BaseModel):
    # Rolling window sent from the browser: [N_frames, 543, 3]
    # N can be 1..60; the backend pads/trims to 60 automatically.
    # We use Optional[float] because missing landmarks are sent as null.
    frames: _List[_List[_List[_Optional[float]]]]
    language: _Optional[str] = "english"
    w: _Optional[int] = 640
    h: _Optional[int] = 480

class SentenceRequest(_BaseModel):
    gloss: _List[str]  # list of sign words e.g. ["hello", "world"]
    language: _Optional[str] = "english"

class BatchSignRequest(_BaseModel):
    words: _List[str]

class GlossRequest(_BaseModel):
    sentence: str
    language: _Optional[str] = "english"


def normalize_sign_words(raw_words: _List[str]) -> _List[str]:
    """Normalize input tokens and expand common contractions for sign lookup."""
    normalized = []
    for raw in raw_words:
        if raw is None:
            continue
        cleaned = re.sub(r"[^a-z0-9']", "", str(raw).lower().strip())
        if not cleaned:
            continue

        cleaned_no_apostrophe = cleaned.replace("'", "")
        if cleaned_no_apostrophe == "im":
            normalized.extend(["i", "am"])
            continue

        normalized.append(cleaned_no_apostrophe)
    return normalized


ARABIC_TRANSLATIONS = {
    "baby": "طفل",
    "eat": "أكل",
    "father": "أب",
    "finish": "انتهى",
    "good": "جيد",
    "happy": "سعيد",
    "hear": "يسمع",
    "house": "منزل",
    "important": "مهم",
    "love": "حب",
    "mall": "مول",
    "me": "أنا",
    "mosque": "مسجد",
    "mother": "أم",
    "normal": "طبيعي",
    "sad": "حزين",
    "stop": "توقف",
    "thanks": "شكراً",
    "thinking": "يفكر",
    "worry": "قلق"
}

ARABIC_TO_ENGLISH = {
    "طفل": "baby", "أطفال": "baby", "اطفال": "baby",
    "أكل": "eat", "اكل": "eat", "طعام": "eat", "ياكل": "eat", "يأكل": "eat",
    "أب": "father", "اب": "father", "والد": "father", "بابا": "father",
    "انتهى": "finish", "خلص": "finish", "انتهيت": "finish",
    "جيد": "good", "جميل": "good", "بخير": "good",
    "سعيد": "happy", "فرحان": "happy", "مبسوط": "happy",
    "يسمع": "hear", "سمع": "hear", "يصغي": "hear",
    "منزل": "house", "بيت": "house", "دار": "house",
    "مهم": "important", "ضروري": "important",
    "حب": "love", "يحب": "love", "أحب": "love",
    "مول": "mall", "سوق": "mall", "متجر": "mall",
    "أنا": "me", "انا": "me", "نفسي": "me",
    "مسجد": "mosque", "جامع": "mosque",
    "أم": "mother", "ام": "mother", "والدة": "mother", "ماما": "mother",
    "طبيعي": "normal", "عادي": "normal",
    "حزين": "sad", "زعلان": "sad",
    "توقف": "stop", "قف": "stop", "بس": "stop",
    "شكرا": "thanks", "شكراً": "thanks",
    "يفكر": "thinking", "فكر": "thinking", "تفكير": "thinking",
    "قلق": "worry", "قلقان": "worry", "خوف": "worry"
}

def translate_arabic_to_english(word: str) -> str:
    word_str = str(word).strip()
    if not any('\u0600' <= char <= '\u06FF' for char in word_str):
        return word_str
    
    clean_w = re.sub(r"[.,\/#!$%\^&\*;:{}=\-_`~()]", "", word_str).strip()
    if clean_w in ARABIC_TO_ENGLISH:
        return ARABIC_TO_ENGLISH[clean_w]
        
    try:
        prompt = (
            f"Translate the following Arabic sign language word or short phrase directly to its closest single-word or short-phrase English equivalent. "
            f"Output ONLY the translated English words, without explanation, without quotes, and without punctuation.\n\n"
            f"Arabic: {clean_w}\n"
            f"English:"
        )
        translated = call_gemini_llm(prompt)
        translated = re.sub(r'["\']', '', translated).strip().lower()
        if translated:
            try:
                print(f"[Translate API] Translated Arabic '{clean_w}' to English '{translated}' using Gemini")
            except UnicodeEncodeError:
                print(f"[Translate API] Translated Arabic word to English '{translated}' using Gemini")
            return translated
    except Exception as e:
        try:
            print(f"[Translate API Error] {e}")
        except UnicodeEncodeError:
            print("[Translate API Error] UnicodeEncodeError (Arabic chars in error message)")
    
    return word_str



def _with_server_timing(payload: dict, response: Response, infer_ms: float) -> dict:
    """Expose server-side inference time so the browser can separate compute from
    network RTT (visible in Chrome DevTools → Network → Timing, and as `server_ms`
    in the JSON body). Pure observability — no behavioural change."""
    response.headers["Server-Timing"] = f"infer;dur={infer_ms:.1f}"
    payload["server_ms"] = round(infer_ms, 1)
    return payload


# SIGN_DEBUG=1 logs a one-line summary of exactly what reaches each model
# (shape, missing-landmark encoding, per-hand presence) so a live session can
# be compared against the offline contract without a debugger. Off by default;
# pure observability. Pairs with the browser-side SignDiag HUD (?diag=1).
SIGN_DEBUG = os.environ.get("SIGN_DEBUG", "0") == "1"


def _debug_payload_summary(frames, language, w, h, source):
    if not SIGN_DEBUG:
        return
    try:
        import numpy as _np
        arr = _np.array(frames, dtype=_np.float32)
        if arr.ndim == 2:  # a single frame
            arr = arr[None, ...]
        n = arr.shape[0]
        if arr.ndim == 3 and arr.shape[1] == 543:
            lh, rh = arr[:, 468:489], arr[:, 522:543]
        elif arr.ndim == 3 and arr.shape[1] == 59:
            lh, rh = arr[:, :21], arr[:, 38:59]
        else:
            print(f"[SignDebug:{source}] lang={language} UNEXPECTED shape={tuple(arr.shape)}")
            return

        def _present(part):
            flat = part.reshape(n, -1)
            return int(_np.sum(~_np.all(_np.isnan(flat) | (flat == 0.0), axis=1)))

        nan_pct = float(_np.mean(_np.isnan(arr))) * 100.0
        zero_pct = float(_np.mean(arr == 0.0)) * 100.0
        print(f"[SignDebug:{source}] lang={language} w={w} h={h} frames={n} "
              f"shape={tuple(arr.shape)} NaN={nan_pct:.1f}% zeros={zero_pct:.1f}% "
              f"lh_present={_present(lh)}/{n} rh_present={_present(rh)}/{n} "
              f"x_range=({_np.nanmin(arr[..., 0]):.3f},{_np.nanmax(arr[..., 0]):.3f})")
    except Exception as e:  # noqa: BLE001 — diagnostics must never break inference
        print(f"[SignDebug:{source}] summary failed: {e}")


@app.post("/api/translate")
async def translate_sign(
    body: TranslateRequest,
    response: Response,
    current_user: dict = Depends(get_current_user),
    _rl: None = Depends(require_api_rate_limit),
):
    """Accepts a rolling window of landmark frames, runs TFLite (ASL) or PyTorch (Arabic) inference."""
    lang = (body.language or "english").lower().strip()
    _debug_payload_summary(body.frames, lang, body.w, body.h, "http")
    if lang in ["arabic", "ar", "egyptian", "eg"]:
        engine = get_arabic_engine()
        if engine is None:
            # Try to warm it up; return pending if still loading
            return {"text": "", "confidence": 0.0, "status": "engine_loading"}
        w = body.w if body.w is not None else 640
        h = body.h if body.h is not None else 480
        # Run blocking PyTorch inference in a worker thread to keep the event loop free.
        # Malformed frames raise inside the Arabic predictor (the ASL engine catches
        # internally and returns empty) — match the English contract: an unusable
        # payload is an empty result, not a 500. The socket path already does this.
        with Timer("infer.arabic") as _t:
            try:
                prediction, confidence = await run_in_threadpool(
                    engine.predict_sign_from_landmarks, body.frames, w, h
                )
            except Exception as e:
                print(f"[/api/translate] Arabic inference error on malformed payload: {e}")
                prediction, confidence = None, 0.0
        if prediction:
            arabic_prediction = ARABIC_TRANSLATIONS.get(prediction.lower(), prediction)
            try:
                print(f"[/api/translate] Detected Arabic: {arabic_prediction} ({confidence:.2f})")
            except UnicodeEncodeError:
                print(f"[/api/translate] Detected Arabic: (safe/transliterated) {prediction} ({confidence:.2f})")
            # `raw` is the model's English class key (e.g. "baby") — the display
            # `text` may be its Arabic translation. Clients that need to match a
            # known target (Practice) compare against `raw`.
            return _with_server_timing({"text": arabic_prediction, "raw": prediction, "confidence": float(confidence)}, response, _t.elapsed_ms)
        return _with_server_timing({"text": "", "confidence": 0.0}, response, _t.elapsed_ms)
    else:
        engine = get_asl_engine()
        if engine is None:
            # Try to warm it up; return pending if still loading
            return {"text": "", "confidence": 0.0, "status": "engine_loading"}
        # Run blocking TFLite inference in a worker thread.
        with Timer("infer.asl") as _t:
            prediction, confidence = await run_in_threadpool(engine.predict_sign, body.frames)
        if prediction:
            print(f"[/api/translate] Detected ASL: {prediction} ({confidence:.2f})")
            return _with_server_timing({"text": prediction, "raw": prediction, "confidence": float(confidence)}, response, _t.elapsed_ms)
        return _with_server_timing({"text": "", "confidence": 0.0}, response, _t.elapsed_ms)


@app.post("/api/translate/sentence")
async def translate_sentence_api(
    body: SentenceRequest,
    current_user: dict = Depends(get_current_user),
    _rl: None = Depends(require_api_rate_limit),
):
    """Convert recognized ASL gloss (Topic-Comment) into a natural SVO sentence.

    Uses few-shot gloss→sentence prompting (see gloss.py) through the configured
    LLM provider, with a graceful fallback to the raw gloss when no LLM is
    reachable.
    """
    import gloss as gloss_mod
    lang = (body.language or "english").lower().strip()
    raw_gloss = " ".join(body.gloss)

    # gloss_to_sentence may hit the network LLM — offload it (caching inside it
    # short-circuits repeat gloss, the common case during a conversation).
    with Timer("llm.gloss_to_sentence"):
        sentence = await run_in_threadpool(
            gloss_mod.gloss_to_sentence, body.gloss, lang
        )
    if sentence and sentence != raw_gloss:
        return {"sentence": sentence, "gloss": raw_gloss, "source": "llm"}
    # LLM unavailable / empty: degrade gracefully.
    if lang in ["arabic", "ar", "egyptian", "eg"]:
        return {"sentence": sentence or "", "gloss": raw_gloss, "source": "fallback"}
    return {"sentence": sentence or raw_gloss, "gloss": raw_gloss, "source": "fallback"}


@app.post("/api/gloss")
async def sentence_to_gloss_api(
    body: GlossRequest,
    current_user: dict = Depends(get_current_user),
    _rl: None = Depends(require_api_rate_limit),
):
    """Convert a natural SVO sentence into ASL/ArSL gloss (Topic-Comment) + NMM.

    This is the front of the text-to-sign pipeline: the returned gloss tokens
    feed /api/signs/batch for landmark lookup, and `nmm` carries the non-manual
    marker annotations (facial grammar) the avatar layer can render.
    """
    import gloss as gloss_mod
    lang = (body.language or "english").lower().strip()
    with Timer("llm.english_to_gloss"):
        tokens = await run_in_threadpool(gloss_mod.english_to_gloss, body.sentence, lang)
    nmm = gloss_mod.annotate_nmm(tokens, body.sentence)
    return {"gloss": tokens, "nmm": nmm, "sentence": body.sentence}


from fastapi.responses import StreamingResponse
import io

@app.get("/api/tts")
def text_to_speech_endpoint(
    text: str,
    language: str = "english",
    voice: str | None = None,
    request: Request = None,
    _rl: None = Depends(require_api_rate_limit),
):
    """Synthesize speech. Optional ?voice=<name> overrides the provider default.
    For Gemini TTS, voice names include: Puck, Aoede, Schedar, Kore, Charon, Fenrir, etc.
    """
    lang = language.lower().strip()
    if lang in ["arabic", "ar", "egyptian", "eg", "english", "en"]:
        try:
            audio_bytes = call_gemini_tts(text, lang, voice or None)
            return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail=f"TTS language {language} is not supported.")


from fastapi import UploadFile as _UploadFile, File as _File, Form as _Form

@app.get("/api/tts/voices")
def tts_voices():
    """List available Gemini TTS prebuilt voices and the current per-language defaults."""
    from providers.gemini import GeminiTTS
    tts = get_tts_provider()
    voices = [
        "Aoede","Puck","Charon","Kore","Fenrir","Leda","Orus","Zephyr",
        "Autonoe","Callirrhoe","Despina","Erinome","Gacrux","Iocaste",
        "Laomedeia","Pulcherrima","Rasalgethi","Sadachbia","Sadaltager",
        "Schedar","Sulafat","Umbriel","Vindemiatrix","Zubenelgenubi",
    ]
    # get_tts_provider() returns a FallbackTTS wrapper, never a bare GeminiTTS, so
    # dig the GeminiTTS out of the provider chain to expose the real per-language
    # defaults (otherwise this always returned an empty dict).
    gemini = tts if isinstance(tts, GeminiTTS) else next(
        (p for p in getattr(tts, "_providers", []) if isinstance(p, GeminiTTS)), None
    )
    defaults = {}
    if gemini is not None:
        for lang in ("english", "arabic", "egyptian"):
            defaults[lang] = gemini._resolve_voice(lang)
    return {"voices": voices, "defaults": defaults, "provider": getattr(tts, "name", "unknown")}


@app.post("/api/stt")
async def speech_to_text_endpoint(
    request: Request,
    file: _UploadFile = _File(...),
    language: str = _Form("english"),
    _rl: None = Depends(require_api_rate_limit),
):
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/wav"
        # Blocking network transcription -> worker thread.
        with Timer("stt.transcribe"):
            transcription = await run_in_threadpool(
                call_gemini_stt, audio_bytes, mime_type, language
            )
        return {"text": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT transcription failed: {str(e)}")


@app.get("/api/metrics")
async def metrics(current_user: dict = Depends(get_current_user)):
    """Per-stage latency aggregates (count, avg, p50, p95, max, last) in ms.

    Populated by the Timer instrumentation across the inference / LLM / STT
    pipeline. Useful for the before/after profiling in docs/LATENCY.md.
    """
    return {"stages": profiling.snapshot()}


from fastapi.responses import FileResponse
import sqlite3

def _basename(path: str) -> str:
    """Cross-platform basename. The sign DBs were built on Windows, so stored
    paths use backslashes (e.g. 'signs_videos\\TV.mp4' / 'c:\\...\\baby_0.mp4').
    os.path.basename does NOT split backslashes on Linux, which left the slash in
    the filename and 404'd every video — normalise both separators first."""
    return os.path.basename((path or "").replace("\\", "/")).strip()


# Every directory a sign MP4 might live in (English + Arabic, with/without data/).
_VIDEO_DIRS = [
    os.path.join(BASE_DIR, "data", "signs_videos"),
    os.path.join(BASE_DIR, "signs_videos"),
    os.path.join(BASE_DIR, "data", "signs_videos_ar"),
    os.path.join(BASE_DIR, "signs_videos_ar"),
    os.path.join(BASE_DIR, "data", "signs_ar_videos"),
]


def _find_video_path(filename: str):
    """Absolute path of an on-disk sign video, or None if no file matches."""
    safe_name = _basename(filename)  # backslash-safe (DBs were built on Windows)
    if not safe_name:
        return None
    for d in _VIDEO_DIRS:
        path = os.path.join(d, safe_name)
        if os.path.isfile(path):
            return path
    return None


def get_video_filename(word: str, lang: str = "en") -> str:
    """Return the stored video filename for a sign word (from Postgres)."""
    try:
        from db.base import SessionLocal
        from db.repository import SignRepository
        db = SessionLocal()
        try:
            sign = SignRepository(db).get_exact(word, "ar" if lang in ("ar", "arabic", "egyptian", "eg") else "en")
            if sign and sign.video_filename:
                return _basename(sign.video_filename)
        finally:
            db.close()
    except Exception as e:
        print(f"[ERROR] get_video_filename query failed: {e}")
    return ""


def resolve_video_url(word: str, lang: str = "en"):
    """URL for a sign's video — but ONLY when the file actually exists on disk.

    Knowing the DB filename isn't enough: the Arabic clips aren't shipped in the
    repo and some English words have no clip, so advertising a video_url for them
    makes the dictionary show a 'Watch video' button that then 404s ('Video
    unavailable for this sign'). Returning None instead keeps the button hidden
    and lets the avatar animation stand in."""
    fn = get_video_filename(word, lang)
    if fn and _find_video_path(fn):
        return f"/api/videos/{fn}"
    return None


@app.get("/api/videos/{filename}")
def serve_sign_video(filename: str):
    """Serve a sign MP4 from any of the known video directories (English + Arabic)."""
    path = _find_video_path(filename)
    if path:
        return FileResponse(path, media_type="video/mp4")
    raise HTTPException(status_code=404, detail=f"Video '{_basename(filename)}' not found.")


# NOTE: /api/signs/lookup MUST be registered before /api/signs/{word}
# otherwise FastAPI's wildcard {word} will capture the literal string "lookup".
@app.get("/api/signs/lookup")
async def lookup_signs(
    words: str,
    current_user: dict = Depends(get_current_user)
):
    """GET /api/signs/lookup?words=hello+world — multi-word lookup for avatar animation."""
    db = get_sign_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Sign database not ready.")

    def _sync():
        # SBERT encode + DB query per word — blocking; runs off the event loop.
        word_list = normalize_sign_words(words.split())
        found, missing = [], []
        for w in word_list:
            lms = db.get_landmarks(w)
            if lms:
                found.append({"word": w, "landmarks": lms, "frame_count": len(lms)})
            else:
                missing.append(w)
        return {"found": found, "missing": missing}

    with Timer("signs.lookup"):
        return await run_in_threadpool(_sync)


@app.get("/api/signs/{word}")
async def get_sign_landmarks(
    word: str,
    current_user: dict = Depends(get_current_user)
):
    """Lookup landmark sequence for a single word (semantic match) and include video_url if available."""
    db = get_sign_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Sign database not ready.")

    def _sync():
        # translate_arabic_to_english may hit the LLM; get_landmarks runs SBERT —
        # both blocking, so the whole lookup runs in a worker thread.
        translated_word = translate_arabic_to_english(word)
        normalized_words = normalize_sign_words([translated_word])
        if not normalized_words:
            raise HTTPException(status_code=404, detail=f"Sign not found for '{word}'.")

        if len(normalized_words) > 1:
            full_phrase = " ".join(normalized_words)
            lm = db.phrase_landmarks(full_phrase)
            if lm is not None:
                video_url = resolve_video_url(full_phrase)
                return {"word": full_phrase, "landmarks": lm, "frame_count": len(lm), "video_url": video_url}

        lookup_word = normalized_words[0]
        lms = db.get_landmarks(lookup_word)
        if lms:
            matched_sign = db.match_word(lookup_word)
            video_url = resolve_video_url(matched_sign or lookup_word)
            return {"word": lookup_word, "landmarks": lms, "frame_count": len(lms), "video_url": video_url}
        raise HTTPException(status_code=404, detail=f"Sign not found for '{word}'.")

    with Timer("signs.single"):
        return await run_in_threadpool(_sync)


@app.post("/api/signs/batch")
async def get_batch_sign_landmarks(
    body: BatchSignRequest,
    current_user: dict = Depends(get_current_user)
):
    """Lookup landmarks for multiple words at once (POST version).
    
    Strategy:
    1. First try to match the complete phrase (e.g., "i am fine" as one unit)
    2. If not found, fall back to individual word matching
    3. Deduplicates consecutive identical matched signs
    """
    db = get_sign_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Sign database not ready.")

    def _sync():
        translated_words = [translate_arabic_to_english(w) for w in body.words]
        normalized_words = normalize_sign_words(translated_words)

        # Try matching the complete phrase first
        if normalized_words and len(normalized_words) > 1:
            full_phrase = ' '.join(normalized_words)
            lm = db.phrase_landmarks(full_phrase)
            if lm is not None:
                video_url = resolve_video_url(full_phrase)
                return {
                    "found": [{"word": full_phrase, "landmarks": lm, "frame_count": len(lm), "video_url": video_url}],
                    "missing": []
                }

        # Fall back to individual word matching
        found = []
        missing = []
        prev_matched_sign = None

        for w in normalized_words:
            lms = db.get_landmarks(w)
            if lms:
                # Get the actual matched word (not the input word)
                matched_sign = db.match_word(w)

                # Skip if this is a duplicate of the previous sign
                if matched_sign == prev_matched_sign:
                    continue

                video_url = resolve_video_url(matched_sign or w)
                found.append({"word": w, "landmarks": lms, "frame_count": len(lms), "video_url": video_url})
                prev_matched_sign = matched_sign
            else:
                # Out-of-vocabulary: try Gloss & Stitch (fingerspell + smooth) before
                # declaring the word unrenderable.
                try:
                    import stitch as stitch_mod
                    stitched = stitch_mod.gloss_and_stitch(w, db)
                except Exception as e:
                    print(f"[Gloss&Stitch] failed for '{w}': {e}")
                    stitched = None
                if stitched:
                    found.append({
                        "word": w, "landmarks": stitched,
                        "frame_count": len(stitched), "video_url": None,
                        "source": "stitch",
                    })
                    prev_matched_sign = None
                else:
                    missing.append(w)
        return {"found": found, "missing": missing}

    with Timer("signs.batch"):
        return await run_in_threadpool(_sync)


# ═══════════════════════════════════════════════════════════════
# ARABIC SIGN DB API (completely separate from English)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/signs_ar/batch")
async def get_batch_arabic_sign_landmarks(
    body: BatchSignRequest,
    current_user: dict = Depends(get_current_user)
):
    """Lookup landmarks for Arabic text-to-sign.
    
    Flow: Arabic input → translate to English → match against 20 Arabic vocab words
    → return landmarks from signs_ar.db (NOT signs.db).
    """
    ar_db = get_arabic_sign_db()
    if ar_db is None:
        raise HTTPException(status_code=503, detail="Arabic sign database not ready.")

    # Translate each word from Arabic to English
    translated_words = [translate_arabic_to_english(w) for w in body.words]
    
    # Flatten multi-word translations
    all_english_words = []
    for tw in translated_words:
        for part in tw.split():
            cleaned = re.sub(r"[^a-z0-9]", "", part.lower().strip())
            if cleaned:
                all_english_words.append(cleaned)

    found = []
    missing = []
    prev_matched = None

    for w in all_english_words:
        lms = ar_db.get_landmarks(w)
        if lms:
            matched = ar_db.match_word(w)
            # Skip consecutive duplicates
            if matched == prev_matched:
                continue
            found.append({"word": w, "landmarks": lms, "frame_count": len(lms)})
            prev_matched = matched
        else:
            missing.append(w)

    return {"found": found, "missing": missing}


@app.get("/api/signs_ar/{word}")
async def get_arabic_sign_landmarks(
    word: str,
    current_user: dict = Depends(get_current_user)
):
    """Single-word Arabic landmark lookup (Sign Dictionary / Practice, ArSL).

    `word` may be an Arabic term or one of the 20 English class keys
    (baby, eat, ...). We try the term directly and its English translation
    against the Arabic sign DB (signs_ar.db).
    """
    ar_db = get_arabic_sign_db()
    if ar_db is None:
        raise HTTPException(status_code=503, detail="Arabic sign database not ready.")

    def _sync():
        candidates = []
        for cand in [word, translate_arabic_to_english(word)]:
            for part in (cand or "").split():
                cleaned = re.sub(r"[^a-z0-9]", "", part.lower().strip())
                if cleaned and cleaned not in candidates:
                    candidates.append(cleaned)
        for w in candidates:
            lms = ar_db.get_landmarks(w)
            if lms:
                matched = ar_db.match_word(w) if hasattr(ar_db, "match_word") else w
                video_url = resolve_video_url(matched or w, lang="ar")
                return {"word": w, "landmarks": lms, "frame_count": len(lms), "video_url": video_url}
        raise HTTPException(status_code=404, detail=f"Arabic sign not found for '{word}'.")

    with Timer("signs.single_ar"):
        return await run_in_threadpool(_sync)


# ── Vocabulary listing (for Sign Dictionary + Practice pages) ──
_VOCAB_CACHE = None
_MODELS_DIR = os.path.join(os.path.dirname(BASE_DIR), "models")

# Lightweight keyword buckets so the dictionary can offer category filters.
# Best-effort: a word not matched by any bucket falls into "general".
_VOCAB_CATEGORIES = {
    "family": {"baby", "father", "mother", "brother", "sister", "grandma", "grandpa",
               "aunt", "uncle", "child", "boy", "girl", "man", "child", "family"},
    "animals": {"animal", "alligator", "bird", "bee", "bug", "cat", "cow", "dog",
                "duck", "elephant", "fish", "frog", "giraffe", "horse", "lion",
                "monkey", "owl", "penguin", "puppy", "snake", "tiger", "zebra"},
    "colors": {"black", "blue", "brown", "green", "orange", "red", "white", "yellow"},
    "food": {"apple", "banana", "carrot", "cereal", "cowboy", "drink", "eat", "food",
             "grapes", "hungry", "milk", "pizza", "water"},
    "actions": {"blow", "callonphone", "can", "clean", "close", "cry", "drink", "drop",
                "eat", "fall", "feed", "find", "finger", "finish", "give", "go", "hate",
                "have", "hear", "hello", "help", "hide", "jump", "kiss", "listen", "look",
                "love", "make", "open", "play", "pretend", "read", "ride", "say", "see",
                "sleep", "stay", "stop", "talk", "think", "thinking", "touch", "wait",
                "wake", "weus", "yes"},
    "feelings": {"afraid", "angry", "bad", "cry", "happy", "hate", "hungry", "love",
                 "mad", "sad", "scared", "sick", "sleepy", "thirsty", "tired", "worry"},
    "places": {"backyard", "bath", "bed", "bedroom", "house", "kitchen", "mall",
               "mosque", "outside", "store"},
}


def _categorize_word(w: str) -> str:
    wl = w.lower()
    for cat, words in _VOCAB_CATEGORIES.items():
        if wl in words:
            return cat
    return "general"


def _load_vocabulary():
    """Read the ASL (250) + Arabic (20) class maps once and tag each word."""
    global _VOCAB_CACHE
    if _VOCAB_CACHE is not None:
        return _VOCAB_CACHE
    import json as _json

    def _read(name):
        path = os.path.join(_MODELS_DIR, name)
        try:
            with open(path, "r", encoding="utf-8") as f:
                return sorted(_json.load(f).keys())
        except Exception:
            return []

    asl_words = _read("sign_to_prediction_index_map.json")
    ar_words = _read("class_mapping.json")

    def _entry(w):
        # English key drives lookups; word_ar/category_ar drive the Arabic UI.
        cat = _categorize_word(w)
        return {
            "word": w,
            "word_ar": _ar_label(w),
            "category": cat,
            "category_ar": _CATEGORY_AR.get(cat, cat),
        }

    _VOCAB_CACHE = {
        "asl": [_entry(w) for w in asl_words],
        "arabic": [_entry(w) for w in ar_words],
        "counts": {"asl": len(asl_words), "arabic": len(ar_words)},
    }
    return _VOCAB_CACHE


@app.get("/api/vocabulary")
async def get_vocabulary(current_user: dict = Depends(get_current_user)):
    """List the recognized ASL + Arabic sign vocabularies with category tags.

    Used by the Sign Dictionary and Practice Mode pages.
    """
    return _load_vocabulary()


# ── WebRTC ICE configuration (STUN + optional Cloudflare TURN) ──
# Without a TURN relay, two peers behind symmetric NAT / carrier-grade NAT
# (most phone↔laptop pairs on different networks) can exchange offers all day
# and never pass media. The client asks this endpoint for iceServers before
# creating peer connections. When Cloudflare Calls TURN credentials are
# configured we mint SHORT-LIVED credentials server-side (the API token never
# reaches the browser or git); otherwise we fall back to public STUN, which
# preserves today's behavior (same-network / permissive-NAT calls).
_STUN_FALLBACK = [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "stun:stun1.l.google.com:19302"},
]
_TURN_KEY_ID = os.environ.get("CLOUDFLARE_TURN_KEY_ID", "").strip()
_TURN_API_TOKEN = os.environ.get("CLOUDFLARE_TURN_API_TOKEN", "").strip()
_TURN_TTL = int(os.environ.get("TURN_TTL_SECONDS", "86400"))
_turn_cache = {"expires": 0.0, "ice_servers": None}
_turn_cache_lock = Lock()


def _mint_ice_servers():
    """Blocking: fetch short-lived TURN credentials from Cloudflare (cached)."""
    now = time.time()
    with _turn_cache_lock:
        if _turn_cache["ice_servers"] and now < _turn_cache["expires"]:
            return _turn_cache["ice_servers"]
    resp = requests.post(
        f"https://rtc.live.cloudflare.com/v1/turn/keys/{_TURN_KEY_ID}/credentials/generate-ice-servers",
        headers={"Authorization": f"Bearer {_TURN_API_TOKEN}",
                 "Content-Type": "application/json"},
        json={"ttl": _TURN_TTL},
        timeout=10,
    )
    resp.raise_for_status()
    ice_servers = resp.json().get("iceServers")
    if not ice_servers:
        raise ValueError("Cloudflare TURN response had no iceServers")
    # Keep STUN alongside TURN so candidate gathering still produces srflx
    # candidates quickly even if the relay is slow to answer.
    if isinstance(ice_servers, dict):
        ice_servers = [ice_servers]
    ice_servers = ice_servers + _STUN_FALLBACK
    with _turn_cache_lock:
        # Refresh at 80% of the TTL so clients never receive nearly-expired creds.
        _turn_cache["ice_servers"] = ice_servers
        _turn_cache["expires"] = now + _TURN_TTL * 0.8
    return ice_servers


@app.get("/api/webrtc-config")
async def webrtc_config(current_user: dict = Depends(get_current_user)):
    """ICE servers for meeting peer connections (STUN + TURN when configured)."""
    if not (_TURN_KEY_ID and _TURN_API_TOKEN):
        return {"iceServers": _STUN_FALLBACK, "turn": False}
    try:
        with Timer("webrtc.mint_ice"):
            ice_servers = await run_in_threadpool(_mint_ice_servers)
        return {"iceServers": ice_servers, "turn": True}
    except Exception as e:
        print(f"[webrtc-config] TURN credential mint failed ({e}); STUN fallback")
        return {"iceServers": _STUN_FALLBACK, "turn": False}


# ═══════════════════════════════════════════════════════════════
# SOCKET.IO — WebRTC signaling & meeting relay
# ═══════════════════════════════════════════════════════════════

rooms: dict = {}  # Map sid -> room_id
# Max participants per meeting room. Mesh WebRTC scales to small groups; keep
# this modest (each peer holds N-1 connections).
MEETING_ROOM_CAP = int(os.environ.get("MEETING_ROOM_CAP", "6"))

@sio.on("connect")
async def on_connect(sid, environ, auth=None):
    token = (auth or {}).get("token") if isinstance(auth, dict) else None
    if token:
        try:
            decode_token(token)
        except HTTPException:
            print(f"[WS] Rejected {sid}: invalid auth token")
            raise ConnectionRefusedError("Unauthorized")
    print(f"[WS] Client connected: {sid}")

@sio.on("disconnect")
async def on_disconnect(sid):
    print(f"[WS] Client disconnected: {sid}")
    # Drop any live streaming buffers held for this client
    for key in [k for k in _stream_states if k[0] == sid]:
        _stream_states.pop(key, None)
    room_id = rooms.pop(sid, None)
    if room_id:
        await sio.emit("peer_left", {"sid": sid}, room=room_id)
        print(f"[WS] {sid} disconnected and left room '{room_id}'")

@sio.on("join_room")
async def join_room(sid, data):
    room_id = data.get("room", "general")

    # Existing participants BEFORE this peer joins (the mesh the joiner connects to).
    existing = [s for s, r in rooms.items() if r == room_id]
    if len(existing) >= MEETING_ROOM_CAP:
        await sio.emit("room_full", {"room": room_id}, to=sid)
        print(f"[WS] Rejecting {sid} from room '{room_id}' (room full, cap={MEETING_ROOM_CAP})")
        return

    await sio.enter_room(sid, room_id)
    rooms[sid] = room_id
    # Tell the joiner who is already here so it can initiate a connection to each
    # (the newcomer is the deterministic offerer → avoids glare). Then notify the
    # existing peers that a new peer arrived (they will answer the incoming offer).
    await sio.emit("room_peers", {"peers": existing}, to=sid)
    await sio.emit("new_peer", {"sid": sid}, room=room_id, skip_sid=sid)
    print(f"[WS] {sid} joined room '{room_id}' ({len(existing)+1} now present)")

@sio.on("leave_room")
async def leave_room(sid, data):
    room_id = data.get("room", "general")
    await sio.leave_room(sid, room_id)
    rooms.pop(sid, None)
    await sio.emit("peer_left", {"sid": sid}, room=room_id, skip_sid=sid)
    print(f"[WS] {sid} left room '{room_id}'")

@sio.on("announce_presence")
async def announce_presence(sid, data):
    room = data.get("room", "general")
    payload = dict(data) if isinstance(data, dict) else {}
    payload["sender_sid"] = sid
    await sio.emit("presence_announced", payload, room=room, skip_sid=sid)

@sio.on("announce_presence_reply")
async def announce_presence_reply(sid, data):
    room = data.get("room", "general")
    payload = dict(data) if isinstance(data, dict) else {}
    payload["sender_sid"] = sid
    await sio.emit("presence_reply", payload, room=room, skip_sid=sid)

@sio.on("webrtc_offer")
async def webrtc_offer(sid, data):
    # Mesh: route to a specific peer when target_sid is given; otherwise broadcast
    # to the room (1:1 backward-compatibility).
    room = data.get("room", "general")
    target = data.get("target_sid")
    payload = {"sdp": data["sdp"], "sender_sid": sid}
    if target:
        await sio.emit("webrtc_offer", payload, to=target)
    else:
        await sio.emit("webrtc_offer", payload, room=room, skip_sid=sid)

@sio.on("webrtc_answer")
async def webrtc_answer(sid, data):
    room = data.get("room", "general")
    target = data.get("target_sid")
    payload = {"sdp": data["sdp"], "sender_sid": sid}
    if target:
        await sio.emit("webrtc_answer", payload, to=target)
    else:
        await sio.emit("webrtc_answer", payload, room=room, skip_sid=sid)

@sio.on("webrtc_ice_candidate")
async def webrtc_ice_candidate(sid, data):
    room = data.get("room", "general")
    target = data.get("target_sid")
    payload = {"candidate": data["candidate"], "sender_sid": sid}
    if target:
        await sio.emit("webrtc_ice_candidate", payload, to=target)
    else:
        await sio.emit("webrtc_ice_candidate", payload, room=room, skip_sid=sid)

@sio.on("translate_sentence")
async def translate_sentence(sid, data):
    room = data.get("room", "general") if isinstance(data, dict) else "general"
    # Only relay into the room this socket actually joined (a stale client
    # can't caption a room it already left), and stamp the sender server-side
    # so captions are attributable without trusting the client payload.
    if rooms.get(sid) != room:
        return
    payload = dict(data)
    payload["sender_sid"] = sid
    await sio.emit("remote_sentence", payload, room=room, skip_sid=sid)


# ═══════════════════════════════════════════════════════════════
# SOCKET.IO — Live streaming sign recognition
# ═══════════════════════════════════════════════════════════════
# Server-side mirror of the old client-side voting loop. The browser streams
# ONE landmark frame per tick over the persistent socket (instead of POSTing
# the whole 60-frame window to /api/translate every ~750ms). The server keeps
# the rolling buffer + vote buffer per (sid, module), runs inference as frames
# arrive, votes, and pushes an accepted sign back. This removes the repeated
# window re-upload and the per-inference HTTP round-trip blocking.
from collections import deque as _deque, Counter as _Counter

_STREAM_SEQ_LENGTH = 60
# Tuned for fast response on idle hardware: lower buffer/stability fires faster while
# the 2/3 vote requirement still filters noise adequately. CPU headroom is high.
_STREAM_VOTE_BUFFER = 3        # was 5 — 2/3 fills in ~75ms vs 5-vote ~400ms
_STREAM_STABILITY = 2          # was 3 — 2-of-3 agreement
_STREAM_COOLDOWN = 8           # was 18 — ~400ms between detections (was ~900ms)
_STREAM_MIN_SEQ = 6            # was 12 — first inference fires after 6 frames (~300ms)
# 0.025s = 40 inferences/s.  Client sends at 20fps so this never over-runs the
# frame arrival rate; it just means we never throttle on this machine.
_STREAM_MIN_INTERVAL = float(os.environ.get("STREAM_MIN_INTERVAL_S", "0.025"))


class _StreamState:
    __slots__ = ("frames", "votes", "cooldown", "last_pred", "last_conf", "language", "w", "h", "busy", "last_infer", "dbg_n")

    def __init__(self, language: str, w: int, h: int):
        self.frames = _deque(maxlen=_STREAM_SEQ_LENGTH)
        self.votes = _deque(maxlen=_STREAM_VOTE_BUFFER)
        self.cooldown = 0
        self.last_pred = None
        self.last_conf = 0.0
        self.language = language
        self.w = w
        self.h = h
        self.busy = False
        self.last_infer = 0.0
        self.dbg_n = 0  # frames received; drives the throttled SIGN_DEBUG summary


# keyed by (sid, module) so a client can run vision + speech panels independently
_stream_states: dict = {}


@sio.on("sign_start")
async def sign_start(sid, data):
    module = (data or {}).get("module") or "vision"
    language = ((data or {}).get("language") or "english").lower().strip()
    try:
        w = int((data or {}).get("w") or 640)
        h = int((data or {}).get("h") or 480)
    except (TypeError, ValueError):
        w, h = 640, 480
    _stream_states[(sid, module)] = _StreamState(language, w, h)
    await sio.emit("sign_ready", {"module": module}, to=sid)


@sio.on("sign_reset")
async def sign_reset(sid, data):
    """Client signals a true hand-gap: flush stale frames/votes (mirrors sequence.clear())."""
    module = (data or {}).get("module") or "vision"
    st = _stream_states.get((sid, module))
    if st is not None:
        st.frames.clear()
        st.votes.clear()
        st.last_pred = None


@sio.on("sign_stop")
async def sign_stop(sid, data):
    module = (data or {}).get("module") or "vision"
    _stream_states.pop((sid, module), None)


@sio.on("sign_frame")
async def sign_frame(sid, data):
    module = (data or {}).get("module") or "vision"
    st = _stream_states.get((sid, module))
    if st is None:
        return
    frame = (data or {}).get("frame")
    if frame is None:
        return

    st.frames.append(frame)
    st.dbg_n += 1
    if SIGN_DEBUG and (st.dbg_n == 1 or st.dbg_n % 100 == 0):
        _debug_payload_summary([frame], st.language, st.w, st.h,
                               f"socket:{module}:frame#{st.dbg_n}")

    # Per-frame cooldown tick (mirrors the script's global_cooldown decrement)
    if st.cooldown > 0:
        st.cooldown -= 1
        if st.cooldown == 0:
            # Cooldown done — allow the same sign to be recognized again. Without
            # this, a sign signed twice in a row (e.g. "good good") is dropped
            # forever by the `winner != st.last_pred` guard below.
            st.last_pred = None
        return
    # Drop frames that arrive while an inference is still running, and wait until
    # we have a usable window. Dropping is fine — the rolling buffer stays fresh.
    if st.busy or len(st.frames) < _STREAM_MIN_SEQ:
        return
    # Throttle inference cadence so a single CPU isn't pegged by the frame stream.
    # last_infer is stamped when the PREVIOUS inference finished (in the finally
    # below), so this enforces a real minimum gap between inferences — stamping it
    # here (before the await) made the throttle a no-op because `busy` already
    # serialized inference and the elapsed time always exceeded the interval.
    now = time.monotonic()
    if now - st.last_infer < _STREAM_MIN_INTERVAL:
        return

    st.busy = True
    try:
        frames = list(st.frames)
        lang = st.language
        if lang in ("arabic", "ar", "egyptian", "eg"):
            engine = get_arabic_engine()
            if engine is None:
                return
            with Timer("stream.infer.arabic"):
                prediction, confidence = await run_in_threadpool(
                    engine.predict_sign_from_landmarks, frames, st.w, st.h
                )
            display = ARABIC_TRANSLATIONS.get(prediction.lower(), prediction) if prediction else ""
        else:
            engine = get_asl_engine()
            if engine is None:
                return
            with Timer("stream.infer.asl"):
                prediction, confidence = await run_in_threadpool(engine.predict_sign, frames)
            display = prediction or ""

        if not prediction:
            return

        # Live confidence for the dashboard ring / sparkline (every inference)
        st.last_conf = float(confidence)
        await sio.emit("sign_conf", {"module": module, "confidence": st.last_conf}, to=sid)

        # Majority vote — mirrors Counter(vote_buffer).most_common(1)
        st.votes.append(prediction)
        if len(st.votes) >= _STREAM_VOTE_BUFFER:
            winner, count = _Counter(st.votes).most_common(1)[0]
            if count >= _STREAM_STABILITY and winner != st.last_pred:
                st.last_pred = winner
                st.votes.clear()
                st.frames.clear()
                st.cooldown = _STREAM_COOLDOWN
                disp = (ARABIC_TRANSLATIONS.get(winner.lower(), winner)
                        if lang in ("arabic", "ar", "egyptian", "eg") else winner)
                await sio.emit("sign_detected", {
                    "module": module,
                    "word": disp,
                    "raw": winner,          # English class key, for target matching
                    "confidence": st.last_conf,
                }, to=sid)
    except Exception as e:
        # A single bad frame (ragged landmarks, transient model error, dead client)
        # must not silently kill this client's stream. Log and keep going.
        print(f"[sign_frame] inference error (sid={sid}, module={module}): {e}")
    finally:
        st.busy = False
        st.last_infer = time.monotonic()


# ═══════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(socket_app, host="0.0.0.0", port=port, reload=False)

