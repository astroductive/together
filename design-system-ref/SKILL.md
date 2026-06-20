---
name: together-design
description: Use this skill to generate well-branded interfaces and assets for Together — a bilingual (Arabic/English) sign-language translation platform with three products (SignLens, SignBridge, HandTalk) — for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill first — it is the full design guide (brand context, the three products, content voice, visual foundations, iconography, and a file index). Then explore the other available files.

Key entry points:
- `styles.css` — the single CSS entry point (link it; it `@import`s all tokens + fonts).
- `tokens/` — color, type, spacing/radius/elevation/motion custom properties.
- `components/` — React primitives (Button, Badge, Pill, Card, Avatar, Logo, Input, Switch, Segmented, NavItem, ThemeToggle, StatCard). Each has a `.prompt.md` with usage.
- `ui_kits/` — full-screen recreations: `marketing/` (glass landing) and `signlens/` `signbridge/` `handtalk/` (the three product workspaces, sharing `lib/AppShell.jsx` + `lib/icons.jsx`).
- `guidelines/*.card.html` — visual specimens for colors, type, spacing, brand.
- `assets/` — logos, hero/feature imagery, bundled Thmanyah fonts.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and follow the rules here to become an expert in designing with this brand.

Brand shorthand: monochrome ink/paper base + **teal `#1F8A82`** accent + warm **sand `#E2B483`**; **Bricolage Grotesque** display (tight, sentence-case headlines), **DM Sans** body, **DM Mono** eyebrows; glass surfaces on marketing, solid dark surfaces in-app; Lucide icons at 1.5–1.8 stroke; **bilingual, Arabic first-class and RTL-aware**; calm, plain, accessible voice; no emoji.

If the user invokes this skill without other guidance, ask what they want to build or design, ask a few clarifying questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
