# Together — 80-second Website Trailer · Google Flow (Veo 3.1 Quality) Production Plan

**Budget:** 1000 credits · Veo 3.1 Quality @ 100 credits/video · **1x outputs** → exactly 10 clips × ~8 s = **80 s**.
**Aspect:** 16:9 · **Model:** Veo 3.1 Quality · **Outputs per prompt:** 1.

All input images live in `docs/trailer/` (rendered from the real site at 3840×2160).

---

## Ingredients vs. Frames — the decision

Use **both, per clip** — this is the single most important choice for quality:

| Mode | When | Why |
| --- | --- | --- |
| **Frames to Video** (first frame, sometimes first + last) | Clips 1, 2, 3, 6, 7, 10 — any clip where the real UI or logo must be pixel-perfect | Veo cannot reliably *generate* UI text; but if the text arrives as a real screenshot in frame 1 and the camera move is slow, it stays crisp. First+last frames also give exact brand start/end points. |
| **Ingredients to Video** (up to 3 reference images) | Clips 4, 5, 8, 9 — any clip that mixes a human being with the product UI | Veo composes a new scene (person + laptop + UI) *in the style of* the references. UI text in these clips is kept to single large words (HELLO, chips, code letters) to stay legible. |

Rule of thumb: **exact UI → Frames; humans + UI → Ingredients.**

---

## Asset → prompt map

| File | Used in | How |
| --- | --- | --- |
| `I-logo-lockup-light.png` | Clip 1 | **end frame** (Frames mode) |
| `A-landing-hero-light.png` | Clip 2 | **first frame** |
| `B-dashboard-en-dark.png` | Clip 3 | **first frame**; Clips 4–5 **ingredient** |
| `K-logo-mark-dark.png` | Clips 4, 5, 8 | **ingredient** (brand anchor) |
| `D-avatar-hello.png` | Clip 6 **first frame**; Clip 9 **ingredient** |
| `C-dashboard-ar-dark.png` | Clip 7 | **first frame** |
| `F-signline-page-dark.png` | Clips 8, 9 | **ingredient** (dark stage + brand type) |
| `G-landing-cta-light.png` | Clip 10 | **first frame** |
| `J-logo-lockup-dark.png` | Clip 10 | **end frame** |
| `E-avatar-you-spare.png`, `H-stats-panel-spare.png`, `L-landing-arabic-spare.png` | spares | retries / alternate takes |

---

## Music continuity (read before generating)

Every prompt below pins the same score description — *"minimal warm felt-piano and a soft electronic pulse at 90 BPM, hopeful and human"* — so clips feel related. Veo still composes each clip's music independently, so for the final stitch: keep Veo's **dialogue and SFX**, but duck or mute its **music** and lay one continuous 80-second track underneath in your editor (or Flow's Scenebuilder). That one change makes the trailer feel professionally scored.

---

## The 10 prompts

### Clip 1 · 0:00–0:08 — Cold open: hands become the logo
**Mode:** Frames to Video · **End frame:** `I-logo-lockup-light.png` (leave start frame empty; if Flow requires a start frame, switch to Ingredients with the same image).

> Cinematic close-up, soft morning daylight through a window, shallow depth of field. Two people face each other; we see only their hands. One person's hands sign fluidly in American Sign Language; the other's hands respond — a real conversation in sign, warm skin tones, gentle dust motes in the light. The two hands drift toward each other in slow motion — one hand from the left, one from the right, almost touching. The scene gently dissolves to a clean off-white background where the exact logo from the reference image resolves: a flat teal hand and a flat warm-sand hand side by side with two small dots above, next to the lowercase serif wordmark "together" and the small caps tagline. Camera: slow push-in, then settle to a locked frame. Audio: quiet room tone, fabric rustle of moving hands, a minimal warm felt-piano and a soft electronic pulse at 90 BPM begin, hopeful and human; a soft airy whoosh as the logo resolves. No narration, no other on-screen text.

### Clip 2 · 0:08–0:16 — The landing page comes alive
**Mode:** Frames to Video · **First frame:** `A-landing-hero-light.png`.

> Screen-recording style, ultra-clean. Begin exactly on the provided website screenshot and keep every pixel of the interface unchanged and sharp. The page breathes: the faint constellation of tiny teal and sand particles drifts slowly, connected by hairline lines; the huge serif headline "Sign, speak, read —" and the teal word "together." stay perfectly crisp. Camera performs a very slow, smooth 10% zoom-in toward the headline. At the 6-second mark a sleek mouse cursor glides in from the lower right and clicks the teal "Open dashboard →" link on the left card; a subtle teal ripple emanates from the click. Do not invent, alter, or add any interface text. Audio: continuing minimal warm felt-piano with a soft electronic pulse at 90 BPM; a soft, satisfying trackpad click exactly on the button press; faint airy interface shimmer.

### Clip 3 · 0:16–0:24 — The dashboard blooms open
**Mode:** Frames to Video · **First frame:** `B-dashboard-en-dark.png`.

> Screen-recording style over a dark, premium web application. Begin exactly on the provided dashboard screenshot — deep near-black interface with frosted-glass panels — and keep all interface text pixel-crisp and unchanged. Enormous soft-blurred aurora blobs of teal and warm sand drift very slowly behind the glass panels, like slow northern lights. The green "Ready" pill pulses gently. The four stat tiles catch a subtle light sweep, left to right. At the 5-second mark the cursor glides to the teal "Start Camera" button and clicks; the dark camera viewport in the center gently brightens with a soft teal glow as if a webcam is warming up. Camera: slow 8% push toward the Live Camera panel. Do not invent or alter any interface text. Audio: the felt-piano continues, joined by a low warm synth pad; one soft UI click; a rising gentle shimmer as the viewport lights up.

### Clip 4 · 0:24–0:32 — She signs; the machine understands
**Mode:** Ingredients to Video · **Ingredients:** `B-dashboard-en-dark.png` + `K-logo-mark-dark.png`.

> A warm, real scene: a young Deaf woman at a bright home desk by a window, signing naturally and confidently toward her open laptop, soft daylight, shallow depth of field. Cut to her laptop screen: the dark glass dashboard from the reference image, where the central camera panel shows her live webcam feed. Over her moving hands, a live motion-capture skeleton is drawn in thin glowing neon lines — pure cyan (#00FFFF) on one hand, pure magenta (#FF00FF) on the other — with tiny dots at every finger joint, tracking her precisely and smoothly. A small red "LIVE" pill sits in the corner. Beneath the video, small rounded teal word-chips pop in one by one in a glass bar: "HELLO", then "NICE", then "MEET", then "YOU". Keep all other interface text from the reference unchanged; do not invent new labels. Audio: quiet room ambience; a soft electronic tick as each word-chip appears; the minimal warm felt-piano and soft electronic pulse at 90 BPM continue underneath.

### Clip 5 · 0:32–0:40 — The sentence speaks (VoiceBridge)
**Mode:** Ingredients to Video · **Ingredients:** `B-dashboard-en-dark.png` + `K-logo-mark-dark.png`.

> Extreme close-up macro of a laptop screen showing the dark glass interface from the reference image, slight screen-glass reflection, very shallow depth of field. In a frosted transcription bar, four small teal word-chips reading "HELLO", "NICE", "MEET", "YOU" glow softly. A small blue badge appears, pulsing: "Composing…". The chips slide together and collapse into one clean white serif sentence: "Hello, nice to meet you." As the sentence appears it is spoken aloud by a warm, natural synthesized female voice: "Hello — nice to meet you." While the voice speaks, a row of slim green audio-level bars dances in rhythm with the speech. A small overlay caption fades in bottom-right in mono type: "<50ms · 100% on-device". Do not add any other text. Audio: the spoken line clearly in the foreground; soft synth swell beneath; the 90 BPM felt-piano pulse continues; a gentle whoosh as chips merge.

### Clip 6 · 0:40–0:48 — Words become sign (the avatar hero shot)
**Mode:** Frames to Video · **First frame:** `D-avatar-hello.png`.

> Begin exactly on the provided image: a glowing neon stick-figure avatar on a dark canvas with a faint grid and a soft teal radial glow — white round-capped limb lines, cyan skeletal hand, translucent cyan face outline, the word "HELLO" in bold white capitals below, a teal progress bar along the bottom, a small "+2" pill top-right. The avatar comes alive and signs fluidly and gracefully in sign language — arms sweeping, individual glowing fingers articulating clearly — as the teal progress bar fills smoothly to the right. The grid shimmers subtly; the teal glow breathes. Near the end the avatar settles into a new pose and the word label crossfades from "HELLO" to "THANK YOU". Camera: very slow orbital drift, a few degrees, with a gentle push-in. Keep the exact visual style of the first frame throughout — thin neon lines, dark background, no 3D character, no realistic human. Audio: airy pads and soft digital shimmer over the continuing 90 BPM felt-piano pulse; a faint electronic sparkle as the word label changes.

### Clip 7 · 0:48–0:56 — Arabic is a first-class citizen
**Mode:** Frames to Video · **First frame:** `C-dashboard-ar-dark.png`.

> Screen-recording style over a dark right-to-left Arabic web application. Begin exactly on the provided screenshot — the same premium dark glass dashboard, perfectly mirrored, sidebar on the right, Arabic labels throughout — and keep every character of Arabic text pixel-crisp and unchanged. The teal and sand aurora blobs drift slowly behind the glass. At the 3-second mark the cursor clicks the teal button "تشغيل الكاميرا"; the central viewport gently brightens and shows a young Egyptian man signing in Egyptian Sign Language, a thin cyan and magenta neon skeleton tracking his hands. A small teal chip appears beneath the video with the Arabic word "مرحباً". Camera: slow 8% push toward the viewport. Do not invent or alter any interface text. Audio: the same 90 BPM felt-piano and soft pulse, now colored with a warm, subtle qanun string texture; one soft click; a gentle tick as the chip appears.

### Clip 8 · 0:56–1:04 — SignLine: everyone in the same room
**Mode:** Ingredients to Video · **Ingredients:** `F-signline-page-dark.png` + `B-dashboard-en-dark.png` + `K-logo-mark-dark.png`.

> A dark, elegant video-meeting interface in the exact visual style of the reference images — near-black background, frosted glass, serif display type, teal accents. A large, letter-spaced five-letter meeting code "ABCDE" appears center-screen with a small teal "Copy meeting link" pill, then gracefully shrinks to the top corner as the call begins. A grid of two rounded 4:3 video tiles fades in: on the left, a Deaf woman labeled "You" signing at her desk with a thin cyan-and-magenta neon skeleton overlay on her hands; on the right, a smiling hearing colleague in an office joins with a soft chime and a small toast notification. A wide black translucent caption bar slides up bottom-center and types out in clean white text: "Sarah: No interpreter needed for quick questions." Keep interface text minimal — only the code, the labels, and the caption. Audio: a warm join-chime; quiet office ambience; keyboard-free silence as the caption types with a soft tick-tick; the 90 BPM felt-piano pulse continues, starting to swell.

### Clip 9 · 1:04–1:12 — Speech signs back (the payoff)
**Mode:** Ingredients to Video · **Ingredients:** `D-avatar-hello.png` + `F-signline-page-dark.png` + `K-logo-mark-dark.png`.

> The same dark meeting interface continues, emotional peak. The hearing colleague leans toward camera and says warmly: "Perfect — see you at three." As he speaks, a third video tile labeled "Speaker → Sign" glows on: inside it, the glowing neon stick-figure avatar from the reference image — white limbs, cyan hand-skeleton, dark grid background — signs his sentence fluidly in real time for the Deaf participant. She raises her hand; a slim amber banner flashes gently at the top: "✋ Sarah wants your attention!" and the whole tile grid pulses with a soft amber glow, once, twice. Both people smile — two languages, one conversation. Camera: slow push toward the avatar tile, then rack focus to the woman's smile. Do not add any other interface text. Audio: the spoken line "Perfect — see you at three." clear and natural; a soft 880 Hz notification beep on the amber flash; the felt-piano and pulse swell warmly to their peak.

### Clip 10 · 1:12–1:20 — Ready to bridge the gap?
**Mode:** Frames to Video · **First frame:** `G-landing-cta-light.png` · **End frame:** `J-logo-lockup-dark.png`.

> Screen-recording style. Begin exactly on the provided webpage screenshot with the rounded teal call-to-action band reading "Ready to bridge the gap?" and two pill buttons. Keep all text pixel-crisp. Camera pushes slowly into the teal band as the white "Try Together Free" button catches a soft light sweep and gently lifts, inviting a click; the drifting particle constellation in the page background twinkles subtly. At the 5-second mark the whole scene dissolves through soft darkness to the exact final image: on a near-black background, the two-hands logo — teal hand, warm-sand hand, two floating dots — beside the lowercase wordmark "together" and the tagline "— SIGN LANGUAGE. ONE WORLD. —", holding steady and clean for the final two seconds while a single small teal dot beside the logo pulses once, like a heartbeat. Do not invent or alter any text. Audio: the felt-piano resolves to a final warm chord; a soft sub-bass swell into the dissolve; near-silence on the end card with one soft, round pulse tone on the dot's heartbeat; clean audio tail.

---

## Production notes

1. **Order matters for retries you don't have.** At 1x you have zero retry budget. If any clip comes back unusable, the most droppable clips are 7 (Arabic — the Arabic *landing* spare `L` can be re-used in clip 2's style) and 5 (its story beat is implied by 4 → 6). Consider generating clips in story order and keeping notes.
2. **Veo's signing is an approximation.** Fluent signers will notice the generated signing in clips 1, 4, 7, 8 is not accurate ASL/ArSL. For the website hero trailer this is normally acceptable, but for the Deaf community audience consider later replacing clip 4's laptop-screen footage with a **real screen recording** (run the app, webcam on: `docker compose up` → dashboard → Start Camera) — the repo also ships 272 real ASL reference clips under `data/signs_videos/` you could intercut.
3. **Stitching:** In Flow, add all 10 clips to one Scenebuilder timeline in order (or download MP4s and stitch in CapCut/Resolve/Premiere). Hard cuts on the beat work; add 6–10-frame crossfades only at 1→2 and 9→10.
4. **Audio mix:** keep Veo dialogue/SFX (clips 5, 8, 9), duck all Veo music, lay one continuous 80 s track. Search terms: "minimal hopeful felt piano soft pulse 90 BPM".
5. **Regenerating assets:** every input image was rendered from the real site. To re-shoot: render templates with Jinja2, serve `app/` statically, screenshot at 1920×1080 @2x with the theme key `together-theme` in localStorage (and a fake JWT under `together_token` for dashboard pages). The avatar frames come from `drawAuraAvatar` (app/static/js/app.js) fed with landmark frames from `data/signs.db` (`signs` table, pickled numpy arrays, word "hello").
