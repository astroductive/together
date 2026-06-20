# Together — Design System

**Together** is a real-time, bi-directional **sign-language translation** platform. It translates between **Egyptian / Arabic Sign Language (ESL/ArSL)** and **American Sign Language (ASL)** on one side, and **text + speech** on the other — live, in the browser, with a webcam. The product is fully **bilingual** (English LTR + Arabic RTL) and built for and with the Deaf and Hard-of-Hearing community.

Tagline: **"Sign language. One world."** · Cairo · Alexandria.

## The three products

The platform is delivered as three named products, each a translation direction:

| Product | Direction | What it does |
| --- | --- | --- |
| **SignLens** | Sign → Text & Voice | Real-time kinetic recognition turns signing into Arabic/English captions and natural speech. |
| **SignBridge** | Text & Speech → Sign | Reverse engine: spoken/typed Arabic or English becomes structured ESL sign guidance via a pose avatar. |
| **HandTalk** | Live meeting | Two-person room (signer ↔ speaker) translated both ways with per-role live captions over WebRTC. |

> A larger marketing taxonomy exists in the source app (SignLens, SignBridge, HandScript, TalkSide, VoiceBridge, SignType, OpenHands). This system consolidates around the three the team named; the others map onto SignLens (recognition) and SignBridge (synthesis) as modes.

## Sources (for whoever has access)

This system was reverse-engineered from an attached codebase — **do not assume the reader has access**, but here is the provenance:

- **Codebase:** `together-main (2)/` — two parts:
  - `together-main/` — the production **FastAPI + Jinja2** app. Canonical token system at `app/static/css/theme.css`, components at `app/static/css/ui.css` (all `t-` prefixed), bundled Thmanyah fonts at `app/static/fonts/`, logos/imagery at `app/static/img/`, product marketing pages at `app/templates/products/`.
  - `Landing page and dashboard/` — a **Figma → React/Vite** export of the marketing landing + dashboard. Figma: `https://www.figma.com/design/Yz2cP4QWYOGjjsE27y7zYR/Landing-page-and-dashboard`. Fonts: Bricolage Grotesque, DM Sans, DM Mono.
- The two directions share fonts and intent; this DS unifies them: **monochrome ink/paper base + teal brand accent + warm sand**, the glassmorphism of the marketing site, and the dark, token-driven app surfaces.

---

## CONTENT FUNDAMENTALS — how Together writes

- **Voice:** calm, plain, human. Short declarative sentences. It explains *for whom* and *why*, never hypes. "Make every room accessible." "The best translation is the one nobody has to wait for."
- **Casing:** Headlines are **sentence case**, often lowercase-leaning, ending in a period for finality ("From the studio." / "One interface for every direction."). The wordmark is always lowercase: **together**. Eyebrows and labels are **UPPERCASE** with wide tracking.
- **The eyebrow motif:** section intros are mono, parenthesized, numbered: `( 01 ) — Five translation modes`. Field-note IDs read `N.001`; dates read `12 · MAY · 26`.
- **Person:** addresses the user as **you** ("Your hands become words"), speaks as **we** about the studio's choices ("We design the signing space first").
- **Bilingual by default:** Arabic appears as a first-class peer, not a translation footnote — `إزيك؟` next to "How are you?", `بدون حواجز` ("without barriers"). Always pair, never replace.
- **Technical copy** (product pages) is confident and specific: real numbers (`<80ms` latency, `94%` top-1, `50+ ESL classes`, `100% on-device`), real pipeline names (MediaPipe Holistic, TFLite, Topic-Comment gloss, SBERT, WebRTC). No vague adjectives.
- **No emoji.** A single small glyph (`✦`, `→`, `·`) is used as a separator/marquee tick — never expressive emoji.
- **Vibe:** editorial, architectural, accessible. Reads like a thoughtful studio that happens to ship ML.

---

## VISUAL FOUNDATIONS

- **Color.** Monochrome spine — ink `#080808` / app ink `#0A0A0C`, warm paper `#F4F4F1`, white. One brand accent: **teal `#1F8A82`** (hover `#16706A`), used sparingly for actions, active states, live dots, gloss text. A warm **sand `#E2B483`** is the secondary (the speaker role, warm tags). Status: live/connected green `#34D399`, success `#059669`, warning `#F59E0B`, danger `#EF4444`. Everything else is the neutral gray ramp. The palette is **mostly neutral with teal punctuation** — resist coloring large areas.
- **Type.** Display = **Bricolage Grotesque** (600/700), set *tight*: tracking `-0.045em`, line-height `0.9` on big headlines. UI/body = **DM Sans** (400/500/650), tracking `-0.012em`. Mono = **DM Mono** for eyebrows, coordinates, timestamps, gloss tokens. Arabic = bundled **Thmanyah Sans / Serif**. Big type is the primary graphic device.
- **Backgrounds.** Marketing: a soft light wash — `radial-gradient` highlights over a `linear-gradient(#f8f8f6 → #ececea)`; one **ink panel** bleeds in from a side (hero, workflow) carrying a subtle teal radial glow and a faint dotted grid (the MediaPipe-landmark motif). App: flat `--bg`, dark by default. No loud gradients, no purple, no noise textures beyond the subtle dot grid.
- **Surfaces / cards.** Two families. **Glass** (marketing): `rgba(255,255,255,.55)`, `backdrop-blur(24px)`, hairline white border, big `32px` radius, soft layered shadow + inset top highlight. **Solid** (app): opaque `--surface`, `1px --border`, `18px` radius, subtle shadow. Plus an **ink** panel variant (dark, white text) for emphasis blocks.
- **Radii.** `9 / 13 / 18 / 22 / 32` px + full pills. App controls cluster at 9–13px; cards 18px; marketing cards 32px; buttons/badges/pills are fully rounded on marketing, 9–13px in the app.
- **Borders.** Hairline and low-contrast — `rgba(0,0,0,.09)` on light, `#25252D` on dark. Active elements get a teal `1px` border + `3px` soft-teal ring, never heavy outlines.
- **Shadows.** Soft, large, low-opacity (ambient daylight, not drop shadows). `shadow-sm` for app cards; `shadow-glass` (layered + inset highlight) for glass; `shadow-lg` for modals/sheets.
- **Motion.** Restrained and expressive. Easing is `cubic-bezier(.16,1,.3,1)` (out-expo) for UI and `cubic-bezier(.65,0,.35,1)` (in-out) for the signature **ink fill-sweep** (feature cards sweep a dark panel up from the bottom, ~450ms, label inverts to white). Marquees scroll linearly. Live/connecting dots **pulse** (opacity 1↔.4, 1.4s). Detection uses a 3-dot **bounce**. Cards lift `-4px` on hover. Respects `prefers-reduced-motion`.
- **Hover / press.** Hover: subtle lift, surface tint to `--surface-2`, or the ink sweep; links go muted→ink. Press: `translateY(1px)` (no scale-down) and accent `brightness(1.05)`. Buttons keep weight 650.
- **Transparency & blur.** Reserved for *floating* chrome over content — the nav ribbon, glass cards, live-caption bars (`rgba(8,8,12,.65–.74)` + small blur), loading scrims. Never blur static body content.
- **Imagery.** Warm, in-focus **hands** in soft natural daylight, shallow depth of field, neutral interiors — humane, never clinical. Cool gray 3D product spots exist for feature blocks. Imagery is used full-bleed in framed cards with a mono caption; people/hands over abstraction.
- **Layout.** Max content width ~1180px. App is a fixed **256px sidebar + fluid main**; topbar holds title + status pill + theme toggle. Generous vertical rhythm (96px section padding on marketing). Everything mirrors for RTL via logical properties — Arabic is not bolted on.

---

## ICONOGRAPHY

- **System:** **Lucide** (the source uses `lucide-react`). 24×24 viewBox, **1.5–1.8 stroke**, round caps and joins, no fill (a few solid glyphs like play/phone). Icons are line-style and quiet — they sit at `--faint`/`--muted` and only go teal when their row/control is active.
- **In this DS:** `ui_kits/lib/icons.jsx` provides a lucide-matched React set (`window.TIcons`) so kits share one source. If you need an icon not present, pull it from Lucide (CDN or `lucide-react`) at the same stroke weight — don't hand-draw a one-off.
- **Brand mark:** two abstract hands forming a shared shape (see `assets/logo-hands*.png` and the geometric `Logo` component). The wordmark is lowercase **together** in Bricolage with the tagline "— SIGN LANGUAGE. ONE WORLD. —".
- **No emoji as icons.** Unicode is used only as typographic separators/ticks (`· → ✦ —`). The signing/landmark motif (dotted skeleton over the camera viewport) stands in for "recognition".
- **Assets** (`assets/`): `logo-hands.png` / `-white.png` / `-dark.png` (icon+wordmark lockups), `logo-together.svg` / `logo-together-white.svg`, `auth-hero.png` (hands hero), `features/{avatar,recognition,sync,ollama}.png` (feature spots), `fonts/` (Thmanyah woff2).

---

## INDEX — what's in this project

**Foundations**
- `styles.css` — the one entry point consumers link (imports only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (spacing + radius + elevation + motion), `base.css` (the `.t-scope` helpers).

**Components** (`window.TogetherDesignSystem_*` after loading `_ds_bundle.js`)
- `components/core/` — Button, Badge, Pill, Card, Avatar, Logo
- `components/forms/` — Input, Switch, Segmented
- `components/navigation/` — NavItem, ThemeToggle
- `components/data/` — StatCard

Each has `.jsx` + `.d.ts` + `.prompt.md`, and one `@dsCard` HTML per directory.

**UI kits** (`ui_kits/`)
- `marketing/` — the glass landing page
- `signlens/`, `signbridge/`, `handtalk/` — the three product workspaces (share `lib/AppShell.jsx` + `lib/icons.jsx`)

**Website** (`site/`) — the full marketing + product site (light glass, dark nav, per-product tints, bilingual EN⇄AR toggle, Three.js hand hero). 9 linked pages: `index.html` (home), `auth.html`, `signlens.html` / `signbridge.html` / `handtalk.html` (product landings), `signlens-app.html` / `signbridge-app.html` / `handtalk-app.html` (the working tools), `about.html` (about + contact). Shared shell in `site/lib/` (`site.jsx` = nav/footer/language, `three-hero.jsx` = 3D hand, `icons.jsx`).

**Specimen cards** — `guidelines/*.card.html` (Colors, Type, Spacing, Brand) populate the Design System tab.

**Other** — `SKILL.md` (Agent-Skill manifest), `assets/`.

> The compiler generates `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — never edit those by hand.
