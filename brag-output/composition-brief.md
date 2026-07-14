# Hyperframes Composition Brief: james-finnie.com — "Signal, found."

## Objective
Create a short launch-style brag video for james-finnie.com — a personal
portfolio/resume presented as a video resume / personal title sequence.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 24.5 seconds

## Source Material
- Project root: `/home/user/website`
- Primary files read: `index.html` (current entropy redesign — canonical), `README.md`
  (stale, describes prior design; used only for context), `assets/`
- Product name: James Finnie — james-finnie.com
- Tagline / strongest claim: "When building is cheap, taste and judgement are the
  moat." (site `.about__quote`, abbreviated)
- Key UI or visual moment to recreate: the entropy particle field (structured lattice
  vs unstructured chaos, divider, corner ticks, `STRUCTURED`/`UNSTRUCTURED` labels,
  `STRUCTURE 000%` HUD) + the terminal design system (mono bracket eyebrows,
  datastrip, hairline lattice cards)
- Copy that must appear verbatim:
  - "When building is cheap," / "taste and judgement are the moat."
  - "James Finnie" ("Finnie" stroke-outlined, as the hero renders it)
  - "[ SENIOR PRODUCT MANAGER — AI & AGENTIC PRODUCT · TORONTO ]" (hero eyebrow, uppercased)
  - Focus card titles + tags: "Deep context systems / SYS-CTX", "Agentic engineering
    / SYS-AGENT", "Prototype → production / SYS-SHIP"
  - "The track record, compressed." (experience sec-title)
  - Datastrip keys/values: "PRODUCT CRAFT 05 YRS", "ORGS SHIPPED 04",
    "NOW CIBC INVESTOR'S EDGE", "FOCUS AI-NATIVE ▲"
  - "Let's build." ("build." in signal blue, as the contact title renders `em`)
  - "JAMES-FINNIE.COM", "GET IN TOUCH →"

## Creative Direction
- Tone preset: cinematic
- Creative direction: quiet premium terminal title-sequence — a signal found in the
  noise; a trading desk booting up
- Interpretation: dramatic reveals, polished restraint; fast-in / long-hold motion;
  slow crossfades over ONE continuous background (the field), never hard resets
- Angle: open in noise, land the site's thesis, structure the field, and let the
  ordered signal introduce James — name, focus, track record — in the site's own
  design language. Ends on the site's contact line.
- Hook: chaos field + typed line "When building is cheap,"
- Outro / punchline: "Let's build." + JAMES-FINNIE.COM + GET IN TOUCH →
- Avoid: generic SaaS language; abstract filler; waveform/equalizer visuals; any
  visual redesign away from the site's tokens

## Visual Identity
- Background: `#050608`; panel `#0A0D13`
- Text: ink `#EDF0F7`, dim `#A2AABB`, faint `#5F6878`
- Accent: signal `#5E8BFF` (tint `rgba(94,139,255,.07)`, line `rgba(94,139,255,.45)`);
  up-green `#2FD07E`; hairlines `rgba(226,233,255,.09)` / `.2`
- Display font: General Sans 500/600 (local woff2, fetched from Fontshare)
- Body font: Switzer 400/500 (local woff2)
- Mono font: IBM Plex Mono 400/500 (local woff2)
- Visual references: hero fig (corner ticks, veil, labels), datastrip, fcard anatomy,
  ghost/primary buttons, film-grain + top signal glow atmosphere, blueprint guides

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary (one continuous field behind all scenes):
1. Hook / Noise — 3.6s — chaos field, `STRUCTURED`/`UNSTRUCTURED` labels, typed
   "When building is cheap," with cursor
2. The claim — 3.8s — "taste and judgement are the moat." lands; STRUCTURE HUD
   starts ticking; field begins ordering
3. Signal / name — 5.2s — field fully structures; corner ticks; eyebrow; "James
   Finnie" word-mask rise (beat-locked 8.74s); lede line
4. Focus modules — 4.8s — 3 fcards arrive on every-other-beat 13.11/14.20/15.29s
5. Datastrip — 3.4s — "The track record, compressed." + 4 cells on beats
   17.47/18.02/18.56/19.10s; 05/04 count up
6. Let's build. — 3.7s — outro title (settle accent locked 22.93s), url + ghost
   button; field dims; music fades out

## Audio
- Audio role: cinematic support
- Audio arc: fade-in under typed keys → full bed through reveal and highlights →
  fade-out from 22.5s so the final impact rings into near-silence
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`,
  track 10, volume 0.35 (timeline-animated fade-in 0→0.35 over 0.8s, fade-out
  22.5→24.4)
- Music cue guidance: bundled preset
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  (109.96 BPM). Strong-cue locks: 8.74s (name), 17.47s (datastrip), 22.93s (outro
  settle). Beat grid for sequential events as in the storyboard.
- Audio-reactive treatment: subtle — pre-extracted per-frame RMS (via
  `extract-audio-data.py`) breathes the field's line/glow brightness and the top
  signal-glow warmth, ±10-15% max. No waveform/equalizer visuals, no text pulsing.
- Audio-coupled moments:
  - Hook typing — randomized `keyboard/keypress-*.wav` ticks per character group
  - Name reveal — one `impact/impactBell_heavy_000.ogg` at the 8.74s lock
  - Focus cards — `casino/card-place-1/2/3.ogg` per arrival (beat-grid)
  - Datastrip cells — `interface/drop_002.ogg` / `interface/click_002.ogg` soft per cell
  - Outro settle — `impact/impactBell_heavy_003.ogg` at 22.93s, rings past the fade
- SFX selection guidance: one sonic palette (bells + soft UI ticks); prefer low
  HF-risk files per `sfx-analysis.md`; align SFX to animation starts; nothing after
  the outro accent
- Exact SFX choice: Hyperframes-owned; volumes 0.45-0.7, music never above 0.35
- Audio files: copied into `brag-output/composition/assets/` (music, sfx, cues)

## Hyperframes Instructions
Use the current `hyperframes` skill set and CLI workflow (hyperframes-core contract).

Implementation decisions (Hyperframes-owned):
- **Monolithic** single `index.html` — the field canvas spans the whole video (the
  documented case for monolithic), scenes are inline `<section class="clip">`
  siblings on alternating visual tracks for slow crossfades.
- The field is a Canvas 2D recreation of the site's Three.js entropy field, driven
  deterministically: per-frame `tl.call()` sampling (audio-visualizer pattern), all
  particle parameters from a seeded PRNG, chaos motion as bounded sums of sinusoids
  (pure functions of frame time — no integration, no `Math.random()` at draw time,
  no clocks).
- Structure progress, camera pose, zoom-to-backdrop and dim are pure functions of
  time inside the draw function (mirrors the site's scroll pose: framed → full-bleed
  dim backdrop).
- Typewriter hook via per-character `tl.call()` textContent updates (no TextPlugin
  dependency); blinking cursor per the typewriter recipe (CSS blink, class swaps).
- Counters via GSAP `innerText` tween with `snap`.
- GSAP vendored locally (`assets/vendor/gsap.min.js`) — no render-time CDN fetch.
- Fonts vendored locally (`assets/fonts/*.woff2`) with `@font-face`.
- Audio-reactive data pre-extracted to `assets/audio-data.json`, loaded via sync XHR.
- All `<audio>` clips are direct children of the composition root; music on track
  10, SFX on tracks 11+, no shared track among overlapping clips.
- Requirements honored: ≥1 real UI/copy element per scene; text readable (fast-in,
  long-hold, reading-time floors from the plan); 24.5s total; lint + check pass
  before render.
