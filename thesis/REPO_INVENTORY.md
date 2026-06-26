# Repository Inventory — *Together: An AI Sign-Language Translator*

This table maps every significant file and folder in the repository to a one-line
purpose. It is the evidence base for the graduation thesis: every technical claim
in the thesis is grounded in one of these artifacts.

Generated from a direct reading of the codebase (branch `claude/together-thesis-graduation-hi4uj6`).

## Top-level

| Path | Purpose |
|------|---------|
| `README.md` | Project overview: pipelines, architecture, layout, run/test instructions, API surface. |
| `requirements.txt` | Python dependency manifest with pinned versions (FastAPI, mediapipe, ai-edge-litert, torch via sentence-transformers, etc.). |
| `start_server.py` | Production entrypoint: sets thread/ML env guards before importing torch, launches uvicorn on the Socket.IO ASGI app. |
| `start_app.py` | Alternative/dev launcher for the application. |
| `Dockerfile` | Container image build for the web service. |
| `docker-compose.yml` | Local orchestration: Postgres (pgvector) + web + Ollama. |
| `render.yaml` | Render.com deployment/platform configuration. |
| `alembic.ini` | Alembic migration configuration. |
| `.env.example` | Documented environment variables (DB DSN, JWT secret, provider keys, tuning knobs). |
| `.github/workflows/ci.yml` | Continuous-integration pipeline (lint/test). |
| `test_imports.py` | Smoke test that heavy ML imports resolve. |
| `import_log.txt` | Captured import diagnostics. |
| `DASHBOARD_AUDIT.md` | Internal audit notes for the dashboard redesign. |

## `models/` — trained model artifacts

| Path | Purpose |
|------|---------|
| `models/model.tflite` | 250-class English **ASL** recognizer (LiteRT/TFLite, ~11 MB), GISLR-style, input `(N, 543, 3)` MediaPipe Holistic landmarks. |
| `models/sign_to_prediction_index_map.json` | Label↔index map for the 250 ASL signs. |
| `models/best_model.pth` | 20-class **ArSL** (Arabic/Egyptian) recognizer (PyTorch CNN-GRU, ~1.1 MB). |
| `models/class_mapping.json` | Label↔index map for the 20 Arabic signs. |
| `models/sign_predictor.py` | `SignLanguageCNNGRU` architecture + `SignLanguagePredictor` (preprocessing, multi-window ensemble, INT8 quantization) for the Arabic model. |

## `engine/` — standalone (desktop) inference & avatar

| Path | Purpose |
|------|---------|
| `engine/asl_inference.py` | `ASLInferenceEngine`: webcam→MediaPipe Holistic→TFLite→vote/cooldown→Ollama gloss-to-sentence (desktop reference pipeline). |
| `engine/asl_avatar.py` | Text→sign avatar: SBERT semantic match + OpenCV "Aura V3" neon landmark renderer; Savitzky-Golay smoothing. |

## `app/server/` — FastAPI + Socket.IO backend

| Path | Purpose |
|------|---------|
| `app/server/main.py` | FastAPI app: page routes, auth/translate/gloss/tts/stt/signs API, Socket.IO WebRTC signaling + live-streaming recognition, lazy model loaders, startup warm-up. |
| `app/server/asl_service.py` | `SignDB`/`ArabicSignDB` (Postgres+pgvector SBERT lookup) and `ASLService` (TFLite 250-class inference, softmax, confidence gate). |
| `app/server/gloss.py` | English↔ASL/ArSL gloss conversion (Topic-Comment), non-manual markers, sentence-type detection, LLM few-shot prompts + cache, rule-based fallback. |
| `app/server/stitch.py` | Gloss-and-stitch: fingerspelling synthesis for out-of-vocabulary words + boundary smoothing. |
| `app/server/landmark_store.py` | On-disk `.npz` landmark store (load/save), keyed by sign id. |
| `app/server/providers/__init__.py` | Provider resolution: `get_llm/tts/stt_provider`, fallback chain assembly from env. |
| `app/server/providers/base.py` | Abstract provider interfaces + `ProviderError` + fallback wrappers. |
| `app/server/providers/gemini.py` | Google Gemini LLM/TTS/STT adapters. |
| `app/server/providers/ollama.py` | Local Ollama LLM adapter (offline fallback). |
| `app/server/providers/local.py` | Offline pyttsx3 (TTS) + faster-whisper (STT) adapters. |
| `app/server/auth.py` | JWT issue/verify, Argon2id hashing (+legacy bcrypt verify/upgrade), refresh-token rotation, sliding-window rate limiting. |
| `app/server/schemas.py` | Pydantic request/response models (UserCreate/Response, Token, etc.). |
| `app/server/profiling.py` | `Timer` context manager + per-stage latency aggregation (count/avg/p50/p95/max) for `/api/metrics`. |
| `app/server/database.py` | SQLAlchemy engine/session/`Base`, `init_db`, `User` re-export, `get_db` dependency. |
| `app/server/db/base.py` | Declarative `Base`, `SessionLocal`, engine bootstrap. |
| `app/server/db/models.py` | ORM models: `User`, `RefreshToken`, `Sign` (pgvector `embedding`, HNSW cosine index). |
| `app/server/db/repository.py` | Repository layer: `SignRepository` (exact/nearest/words), `RefreshTokenRepository` (rotate/revoke). |

## `app/templates/` — Jinja2 views (English + Arabic RTL)

| Path | Purpose |
|------|---------|
| `app/templates/base.html`, `_inner_base*.html`, `_lp_nav*.html`, `_lp_footer*.html` | Shared layout, nav and footer partials (LTR + RTL). |
| `app/templates/landing*.html` | Marketing landing page (EN/AR). |
| `app/templates/index.html`, `index_ar.html` | Main dashboard (sign↔text/speech, meeting) — EN and RTL Arabic (forces ArSL model). |
| `app/templates/login*.html`, `signup*.html`, `profile*.html` | Auth + profile shells. |
| `app/templates/dictionary*.html`, `analytics*.html`, `practice*.html` | Sign Dictionary, Session Analytics, Practice Mode. |
| `app/templates/about*.html`, `contact*.html`, `partnership*.html`, `resources*.html`, `demo*.html` | Content pages (EN/AR). |
| `app/templates/products/*.html` | Product sub-pages (HandScript, VoiceBridge, SignType, TalkSide, SignLine). |
| `app/templates/languages/asl*.html`, `arsl*.html` | Per-language explainer pages. |

## `app/static/` — frontend assets

| Path | Purpose |
|------|---------|
| `app/static/js/app.js` | Client capture/translation pipeline: MediaPipe Holistic, socket streaming, avatar, meeting, TTS/STT. |
| `app/static/js/landmark-player.js` | Canvas player that animates returned landmark sequences (text→sign avatar). |
| `app/static/js/auth.js` | Login/signup/token handling, `requireAuth`. |
| `app/static/js/theme.js` | No-flash light/dark theme controller. |
| `app/static/js/dashboard-extras.js` | Progressive-enhancement dashboard features. |
| `app/static/js/sw.js`, `manifest.webmanifest` | PWA service worker + manifest. |
| `app/static/css/theme.css` | Design-token source of truth (color/type/spacing/elevation; light/dark/RTL). |
| `app/static/css/ui.css` | Reusable `t-`prefixed components (RTL via logical properties). |
| `app/static/css/main.css` | Legacy styles. |
| `app/static/fonts/*.woff2` | Bundled Thmanyah Sans + Serif-Display brand fonts. |
| `app/static/img/*` | Logos, hero, feature imagery. |

## `data/` & `signs_videos/` — sign video corpus

| Path | Purpose |
|------|---------|
| `data/signs_videos/*.mp4` | Reference sign clips used to build landmark DBs and to run the model baseline evaluation. |
| `signs_videos/*.mp4` | Additional root-level sign clips (served by `/api/videos`). |

## `scripts/` — build, evaluation & utility scripts

| Path | Purpose |
|------|---------|
| `scripts/model_baseline_report.py` | Offline evaluation harness that produced `docs/model_baseline_report.*` (Top-1 = 0.624 on 250 ASL clips). |
| `scripts/benchmark.py` | Micro-benchmarks: PyTorch INT8 vs fp32, gloss-cache cold/warm. |
| `scripts/load_test.py` | Concurrency/load test of API endpoints. |
| `scripts/build_db.py` | Build English `signs.db` (MediaPipe landmark extraction + SBERT embeddings) from videos. |
| `scripts/build_arabic_db.py` | Build Arabic `signs_ar.db` analogously. |
| `scripts/migrate_to_postgres.py` | Migrate SQLite sign DBs into Postgres + pgvector. |
| `scripts/check_model.py`, `check_*_import.py` | Model/dependency sanity checks. |
| `scripts/sign-to-text.py`, `sign-to-speech.py`, `text-to-sign.py`, `speech-to-sign.py` | Standalone CLI demos of each pipeline direction. |
| `scripts/test_semantic_matching.py`, `test_multi_word.py`, `compare_vocabularies.py` | SBERT matching / vocabulary diagnostics. |
| `scripts/exhaustive_site_audit.py`, `deep_module_checklist.py`, `regression_browser_pack.py` | QA/audit tooling (+ their `*_report.json`). |
| `scripts/db/init_pgvector.sql` | pgvector extension bootstrap SQL. |
| `scripts/entrypoint.sh` | Container entrypoint (migrate + serve). |

## `tests/` — automated test suite (pytest)

| Path | Purpose |
|------|---------|
| `tests/test_auth.py` | Hashing, JWT, refresh rotation, rate limiting. |
| `tests/test_gloss.py` | Gloss conversion + NMM. |
| `tests/test_providers.py` | Provider fallback-chain behavior. |
| `tests/test_stitch.py` | Fingerspell-and-stitch smoothing. |
| `tests/test_profiling.py` | Timer/metrics aggregation. |
| `tests/test_templates.py` | Frontend regression: every template renders, invariants hold (RTL, design-system links, JS parses). |

## `docs/` — design & evaluation documentation

| Path | Purpose |
|------|---------|
| `docs/GLOSS_AND_NMM.md` | ASL gloss syntax, non-manual markers, gloss-and-stitch design. |
| `docs/LATENCY.md` | Latency profiling/optimizations + measured numbers. |
| `docs/PROVIDERS_AND_PRICING.md` | Provider chains, fallbacks, pricing. |
| `docs/model_baseline_report.md` / `.json` | Real ASL model baseline metrics (Top-1 0.624, confusions). |
| `docs/sign-language-pipeline-model-presentation-72-slides.md` | 72-slide technical deck of the pipeline/model. |

## `alembic/` — database migrations

| Path | Purpose |
|------|---------|
| `alembic/env.py` | Alembic environment wiring. |
| `alembic/versions/0001_initial_schema.py` | Initial schema: pgvector extension, `users`, `refresh_tokens`, `signs` (+ HNSW index). |

## `design-system-ref/` & `scratch/`

| Path | Purpose |
|------|---------|
| `design-system-ref/` | Reference design-system kit (tokens, components, UI kits) the production CSS is derived from. |
| `scratch/` | One-off exploratory scripts (DB checks, model inspection, vocab build). |
