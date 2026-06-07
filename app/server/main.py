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

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import socketio
import os
import uvicorn
from email_validator import EmailNotValidError, validate_email
from threading import Lock
import time
import re

import base64
import requests

GEMINI_API_KEY = "AIzaSyBvdQnId4-i-vF-PGhGXHEQ7fMIjwnuYGs"

def call_gemini_llm(prompt: str, temperature: float = 0.0) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "topP": 0.95
        }
    }
    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        res_data = response.json()
        return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print(f"[Gemini LLM Error] Failed to get response: {e}")
        return ""

def call_gemini_tts(text: str, language: str = "arabic") -> bytes:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
    lang_name = "Egyptian Arabic dialect" if language in ["egyptian", "eg"] else "Modern Standard Arabic"
    prompt = f"Please read the following text aloud. Pronounce it naturally as a native speaker of {lang_name}. Output ONLY the audio representation of this text, nothing else. Text: {text}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["AUDIO"]
        }
    }
    try:
        response = requests.post(url, json=payload, timeout=20)
        response.raise_for_status()
        res_data = response.json()
        parts = res_data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "inlineData" in part:
                audio_b64 = part["inlineData"]["data"]
                return base64.b64decode(audio_b64)
        raise Exception("No inlineData found in Gemini response.")
    except Exception as e:
        print(f"[Gemini TTS Error] Failed to synthesize: {e}")
        raise e

def call_gemini_stt(audio_bytes: bytes, mime_type: str = "audio/wav", language: str = "arabic") -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    
    lang_name = "Egyptian Arabic dialect" if language in ["egyptian", "eg"] else "Modern Standard Arabic"
    prompt = f"Transcribe this audio file. The audio is spoken in {lang_name}. Return ONLY the exact transcription in Arabic script, without any introductory text, explanation, or notes. If there is no speech or it's unintelligible, return an empty string."
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": audio_b64
                        }
                    },
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    try:
        response = requests.post(url, json=payload, timeout=25)
        response.raise_for_status()
        res_data = response.json()
        text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if len(lines) >= 3:
                text = "\n".join(lines[1:-1]).strip()
        return text
    except Exception as e:
        print(f"[Gemini STT Error] Failed to transcribe: {e}")
        return ""

SLOW_REQUEST_MS = float(os.environ.get("SLOW_REQUEST_MS", "5000"))

# ── Local modules ─────────────────────────────────────────────
from database import engine, Base, User, get_db
from auth import (
    create_access_token,
    verify_password,
    get_password_hash,
    get_current_user,
)
from schemas import UserCreate, UserResponse, Token
from asl_service import ASLService, SignDB, ArabicSignDB

# ── App setup ─────────────────────────────────────────────────
app = FastAPI(title="Together — Sign Language AI Platform", version="2.0.0")


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compress non-trivial responses to reduce transfer time on slower networks.
app.add_middleware(GZipMiddleware, minimum_size=1024)

# ── MIME Fix (Windows) ──────────────────────────────────────────
from starlette.middleware.base import BaseHTTPMiddleware
import mimetypes
mimetypes.init()
mimetypes.add_type('application/javascript', '.js', True)

class ForceJSMimeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        started = time.perf_counter()
        response = await call_next(request)
        path = request.url.path.lower()
        elapsed_ms = (time.perf_counter() - started) * 1000.0

        response.headers.setdefault("X-Process-Time-ms", f"{elapsed_ms:.1f}")

        if path.endswith(".js"):
            response.headers["Content-Type"] = "application/javascript"

        # Cache versioned/static assets aggressively for faster repeat page loads.
        if path.startswith("/static/"):
            response.headers.setdefault("Cache-Control", "public, max-age=86400")

        # Lightweight profiling: surface slow dynamic routes in server logs.
        if (not path.startswith("/static/")) and (not path.startswith("/api/health")) and elapsed_ms >= SLOW_REQUEST_MS:
            print(f"[PERF] Slow request: {request.method} {request.url.path} took {elapsed_ms:.1f}ms")

        return response

app.add_middleware(ForceJSMimeMiddleware)

# ── Static files & Templates ──────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# ── Socket.IO ─────────────────────────────────────────────────
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
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

# ── Offline pyttsx3 Arabic TTS Engine ──
_pyttsx3_lock = Lock()

def text_to_speech_arabic(text: str) -> bytes:
    import tempfile
    import os
    try:
        import pyttsx3
    except ImportError:
        raise Exception("pyttsx3 is not installed on this system.")
    
    with _pyttsx3_lock:
        try:
            engine = pyttsx3.init()
        except Exception as e:
            raise Exception(f"Failed to initialize pyttsx3: {e}")

        
        # Look for an Arabic voice
        voices = engine.getProperty('voices')
        arabic_voice = None
        for v in voices:
            name_lower = v.name.lower()
            id_lower = v.id.lower()
            if "arabic" in name_lower or "ar-" in id_lower or "ar_" in id_lower or "naayf" in name_lower or "hoda" in name_lower:
                arabic_voice = v.id
                break
        
        if arabic_voice:
            engine.setProperty('voice', arabic_voice)
        else:
            print("[TTS WARNING] No native Arabic SAPI5 voice found. pyttsx3 will use system default voice.")
            
        temp_file = os.path.join(tempfile.gettempdir(), f"pyttsx3_temp_{os.getpid()}.wav")
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass
                
        try:
            engine.save_to_file(text, temp_file)
            engine.runAndWait()
            
            if os.path.exists(temp_file):
                with open(temp_file, "rb") as f:
                    audio_bytes = f.read()
                try:
                    os.remove(temp_file)
                except:
                    pass
                return audio_bytes
            else:
                raise Exception("pyttsx3 failed to generate WAV file.")
        except Exception as e:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass
            raise e


@app.get("/api/health")
async def health(warm: bool = False):
    """Quick status check.

    By default this endpoint is non-blocking and does not initialize heavy AI models.
    Pass ?warm=1 to trigger lazy initialization in the background request path.
    """
    global _sign_db, _sign_db_error, _asl_engine, _asl_engine_error, _arabic_engine, _arabic_engine_error

    if warm:
        get_sign_db()
        get_asl_engine()
        get_arabic_engine()

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
    }


# ═══════════════════════════════════════════════════════════════
# PAGE ROUTES
# ═══════════════════════════════════════════════════════════════

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(request, "landing.html")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request, lang: str = "en"):
    if lang == "ar":
        return templates.TemplateResponse(request, "index_ar.html")
    return templates.TemplateResponse(request, "index.html")

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse(request, "signup.html")


# ═══════════════════════════════════════════════════════════════
# AUTH API
# ═══════════════════════════════════════════════════════════════

@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
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

    # Check for duplicate email
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )


    hashed = get_password_hash(password)
    new_user = User(
        full_name=full_name,
        email=email,
        hashed_password=hashed,
        role=role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
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
    token = create_access_token(data={
        "sub":       user.email,
        "full_name": user.full_name or "",
        "role":      user.role,
        "user_id":   user.id,
    })
    return {"access_token": token, "token_type": "bearer"}


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



@app.post("/api/translate")
async def translate_sign(
    body: TranslateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Accepts a rolling window of landmark frames, runs TFLite (ASL) or PyTorch (Arabic) inference."""
    lang = (body.language or "english").lower().strip()
    if lang in ["arabic", "ar", "egyptian", "eg"]:
        engine = get_arabic_engine()
        if engine is None:
            # Try to warm it up; return pending if still loading
            return {"text": "", "confidence": 0.0, "status": "engine_loading"}
        w = body.w if body.w is not None else 640
        h = body.h if body.h is not None else 480
        prediction, confidence = engine.predict_sign_from_landmarks(body.frames, w, h)
        if prediction:
            arabic_prediction = ARABIC_TRANSLATIONS.get(prediction.lower(), prediction)
            try:
                print(f"[/api/translate] Detected Arabic: {arabic_prediction} ({confidence:.2f})")
            except UnicodeEncodeError:
                print(f"[/api/translate] Detected Arabic: (safe/transliterated) {prediction} ({confidence:.2f})")
            return {"text": arabic_prediction, "confidence": float(confidence)}
        return {"text": "", "confidence": 0.0}
    else:
        engine = get_asl_engine()
        if engine is None:
            # Try to warm it up; return pending if still loading
            return {"text": "", "confidence": 0.0, "status": "engine_loading"}
        prediction, confidence = engine.predict_sign(body.frames)
        if prediction:
            print(f"[/api/translate] Detected ASL: {prediction} ({confidence:.2f})")
            return {"text": prediction, "confidence": float(confidence)}
        return {"text": "", "confidence": 0.0}


@app.post("/api/translate/sentence")
async def translate_sentence_api(
    body: SentenceRequest,
    current_user: dict = Depends(get_current_user)
):
    """Convert a list of sign gloss words into a natural sentence via Gemini LLM."""
    lang = (body.language or "english").lower().strip()
    gloss = " ".join(body.gloss)
    
    if lang in ["egyptian", "eg"]:
        prompt = (
            f"حوّل كلمات لغة الإشارة المصرية التالية إلى جملة عامية مصرية طبيعية ومترابطة ومفهومة: [{gloss}]\n\n"
            "شروط صارمة:\n"
            "1. يجب أن تغطي الجملة الناتجة معنى كل كلمة في القائمة كاملة.\n"
            "2. لا تحذف أي معنى من الكلمات الأصلية، ولا تترجم إلى الإنجليزية.\n"
            "3. اكتب الجملة باللهجة المصرية العامية فقط، بدون شرح وبدون نص إنجليزي.\n\n"
            f"الكلمات الأصلية: [{gloss}]\nالجملة المصرية الناتجة:"
        )
    elif lang in ["arabic", "ar"]:
        prompt = (
            f"حوّل جميع كلمات لغة الإشارة التالية إلى جملة عربية فصحى طبيعية ومترابطة: [{gloss}]\n\n"
            "شروط صارمة:\n"
            "1. يجب أن تغطي الجملة الناتجة معنى كل كلمة في القائمة كاملة.\n"
            "2. لا تحذف أي معنى من الكلمات الأصلية، ولا تترجم إلى الإنجليزية.\n"
            "3. أضف فقط الأدوات أو حروف الجر أو الروابط اللازمة لجعل الجملة عربية سليمة.\n"
            "4. اكتب الجملة العربية فقط، بدون شرح، وبدون نص إنجليزي، وبدون ترجمة حرفية كلمة بكلمة.\n\n"
            f"الكلمات الأصلية: [{gloss}]\nالجملة العربية الناتجة:"
        )
    else:
        prompt = (
            f"Convert these ASL signs into one short English sentence: [{gloss}]\n\n"
            "STRICT RULES:\n"
            "1. Every signed word MUST appear in your output.\n"
            "2. Only insert: pronouns, articles, linking verbs (is/are/am), prepositions, conjunctions.\n"
            "3. NEVER add action verbs or extra words not signed.\n"
            "4. Output ONLY the sentence.\n\n"
            f"Signed: [{gloss}]\nOutput:"
        )
    try:
        sentence = call_gemini_llm(prompt)
        # Clean up quotes
        sentence = sentence.replace('"', '').replace("'", "").strip()
        if sentence:
            return {"sentence": sentence, "gloss": gloss, "source": "llm"}
        raise Exception("Empty response from Gemini")
    except Exception as e:
        if lang in ["arabic", "ar", "egyptian", "eg"]:
            return {"sentence": "", "gloss": gloss, "source": "fallback"}
        return {"sentence": gloss, "gloss": gloss, "source": "fallback"}


from fastapi.responses import StreamingResponse
import io

@app.get("/api/tts")
def text_to_speech_endpoint(text: str, language: str = "english"):
    lang = language.lower().strip()
    if lang in ["arabic", "ar", "egyptian", "eg"]:
        try:
            audio_bytes = call_gemini_tts(text, lang)
            return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini TTS synthesis failed: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="TTS is only implemented for Arabic and Egyptian.")


from fastapi import UploadFile as _UploadFile, File as _File, Form as _Form

@app.post("/api/stt")
async def speech_to_text_endpoint(
    file: _UploadFile = _File(...),
    language: str = _Form("english")
):
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/wav"
        transcription = call_gemini_stt(audio_bytes, mime_type, language)
        return {"text": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini STT transcription failed: {str(e)}")


from fastapi.responses import FileResponse
import sqlite3

def get_video_filename(word: str) -> str:
    """Helper to query the signs.db for the video_path of a given word."""
    try:
        db_path = os.path.join(BASE_DIR, "data", "signs.db")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT video_path FROM signs WHERE word = ?", (word,))
        row = cur.fetchone()
        conn.close()
        if row and row[0]:
            return os.path.basename(row[0])
    except Exception as e:
        print(f"[ERROR] get_video_filename query failed: {e}")
    return ""

@app.get("/api/videos/{filename}")
def serve_sign_video(filename: str):
    """Serve a sign MP4 video file from the data/signs_videos or root signs_videos directories."""
    safe_name = os.path.basename(filename)
    # 1. Check inside data/signs_videos
    path_data = os.path.join(BASE_DIR, "data", "signs_videos", safe_name)
    if os.path.exists(path_data):
        return FileResponse(path_data, media_type="video/mp4")
    # 2. Check inside root signs_videos
    path_root = os.path.join(BASE_DIR, "signs_videos", safe_name)
    if os.path.exists(path_root):
        return FileResponse(path_root, media_type="video/mp4")
    raise HTTPException(status_code=404, detail=f"Video '{safe_name}' not found.")


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
    word_list = normalize_sign_words(words.split())
    found = []
    missing = []
    for w in word_list:
        lms = db.get_landmarks(w)
        if lms:
            found.append({"word": w, "landmarks": lms, "frame_count": len(lms)})
        else:
            missing.append(w)
    return {"found": found, "missing": missing}


@app.get("/api/signs/{word}")
async def get_sign_landmarks(
    word: str,
    current_user: dict = Depends(get_current_user)
):
    """Lookup landmark sequence for a single word (semantic match) and include video_url if available."""
    db = get_sign_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Sign database not ready.")
    translated_word = translate_arabic_to_english(word)
    normalized_words = normalize_sign_words([translated_word])
    if not normalized_words:
        raise HTTPException(status_code=404, detail=f"Sign not found for '{word}'.")

    if len(normalized_words) > 1:
        full_phrase = " ".join(normalized_words)
        if full_phrase in db.landmarks_dict:
            lm = db.landmarks_dict[full_phrase]
            if lm is not None:
                video_fn = get_video_filename(full_phrase)
                video_url = f"/api/videos/{video_fn}" if video_fn else None
                return {"word": full_phrase, "landmarks": lm.tolist(), "frame_count": len(lm), "video_url": video_url}

    lookup_word = normalized_words[0]
    lms = db.get_landmarks(lookup_word)
    if lms:
        matched_sign = db.match_word(lookup_word)
        video_fn = get_video_filename(matched_sign or lookup_word)
        video_url = f"/api/videos/{video_fn}" if video_fn else None
        return {"word": lookup_word, "landmarks": lms, "frame_count": len(lms), "video_url": video_url}
    raise HTTPException(status_code=404, detail=f"Sign not found for '{word}'.")


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
    
    translated_words = [translate_arabic_to_english(w) for w in body.words]
    normalized_words = normalize_sign_words(translated_words)

    # Try matching the complete phrase first
    if normalized_words and len(normalized_words) > 1:
        full_phrase = ' '.join(normalized_words)
        # Check if the full phrase exists in landmarks
        if full_phrase in db.landmarks_dict:
            lm = db.landmarks_dict[full_phrase]
            if lm is not None:
                video_fn = get_video_filename(full_phrase)
                video_url = f"/api/videos/{video_fn}" if video_fn else None
                return {
                    "found": [{"word": full_phrase, "landmarks": lm.tolist(), "frame_count": len(lm), "video_url": video_url}],
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
            
            video_fn = get_video_filename(matched_sign or w)
            video_url = f"/api/videos/{video_fn}" if video_fn else None
            found.append({"word": w, "landmarks": lms, "frame_count": len(lms), "video_url": video_url})
            prev_matched_sign = matched_sign
        else:
            missing.append(w)
    return {"found": found, "missing": missing}


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


# ═══════════════════════════════════════════════════════════════
# SOCKET.IO — WebRTC signaling & meeting relay
# ═══════════════════════════════════════════════════════════════

rooms: dict = {}

@sio.on("connect")
async def on_connect(sid, environ):
    print(f"[WS] Client connected: {sid}")

@sio.on("disconnect")
async def on_disconnect(sid):
    print(f"[WS] Client disconnected: {sid}")

@sio.on("join_room")
async def join_room(sid, data):
    room_id = data.get("room", "general")
    await sio.enter_room(sid, room_id)
    await sio.emit("new_peer", {"sid": sid}, room=room_id, skip_sid=sid)
    print(f"[WS] {sid} joined room '{room_id}'")

@sio.on("leave_room")
async def leave_room(sid, data):
    room_id = data.get("room", "general")
    await sio.leave_room(sid, room_id)
    print(f"[WS] {sid} left room '{room_id}'")

@sio.on("webrtc_offer")
async def webrtc_offer(sid, data):
    room = data.get("room", "general")
    await sio.emit("webrtc_offer", {"sdp": data["sdp"], "sender_sid": sid}, room=room, skip_sid=sid)

@sio.on("webrtc_answer")
async def webrtc_answer(sid, data):
    room = data.get("room", "general")
    await sio.emit("webrtc_answer", {"sdp": data["sdp"], "sender_sid": sid}, room=room, skip_sid=sid)

@sio.on("webrtc_ice_candidate")
async def webrtc_ice_candidate(sid, data):
    room = data.get("room", "general")
    await sio.emit("webrtc_ice_candidate", {"candidate": data["candidate"], "sender_sid": sid}, room=room, skip_sid=sid)

@sio.on("translate_sentence")
async def translate_sentence(sid, data):
    room = data.get("room", "general")
    await sio.emit("remote_sentence", data, room=room, skip_sid=sid)


# ═══════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(socket_app, host="0.0.0.0", port=port, reload=False)

