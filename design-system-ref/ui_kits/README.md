# UI Kits · Product workspaces

Three product surfaces from the Together app (dark-themed by default; toggle light via the topbar). All three share `lib/AppShell.jsx` (sidebar + topbar) and `lib/icons.jsx`, and compose DS primitives (`Button`, `Card`, `Badge`, `Segmented`, `Switch`, `Avatar`, `Pill`, `NavItem`, `Logo`, `ThemeToggle`).

| Product | Direction | Screen |
| --- | --- | --- |
| **SignLens** (`signlens/`) | Sign → Text & Voice | Camera viewport with live landmark overlay, streaming gloss log, transcript, accuracy/latency metrics. Click **Start recognition**. |
| **SignBridge** (`signbridge/`) | Text & Speech → Sign | Text/mic input → Topic-Comment gloss → pose-avatar sign guide with playback + speed. Type or pick a preset, then **Translate to sign**. |
| **HandTalk** (`handtalk/`) | Live meeting | Two-person room (signer ↔ speaker) with per-role captions, connection states, and a call control bar. Click **Join meeting**. |

Sidebar nav links the three products together so the kit is a click-through.

## Source of truth
Recreated from the `together-main` FastAPI app (`app/templates`, `app/static/css/ui.css`, `theme.css`) and the Figma "Landing page and dashboard" React project. The pipelines (MediaPipe landmarks, gloss/Topic-Comment, pose avatar, WebRTC meeting) are mocked with scripted data — visuals and interactions are faithful, the ML is not real.
