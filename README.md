# james-finnie.com

Personal portfolio for James Finnie — Senior Product Manager focused on AI-native product, agentic engineering, and deep context systems.

**Live:** [james-finnie.com](https://www.james-finnie.com)

---

## What's here

Single-page portfolio with no build step, no framework, no runtime dependencies. Served as static files.

**Sections:** Hero (interactive knowledge graph) · At a glance · About · Focus areas · Selected work · Experience · Capabilities · Contact

```
index.html           markup + meta + JSON-LD
assets/styles.css    all styles (design tokens in :root)
assets/main.js       interactions — nav, reveals, spotlight, clock
assets/graph.js      hero knowledge-graph canvas (vanilla, zero deps)
assets/favicon.svg   favicon
assets/og.png        social share image (generated)
tools/og-image.mjs   one-off OG image generator (npm run og)
tools/screenshot.mjs verification screenshots (npm run shots)
vercel.json          security + caching headers
```

---

## Stack

| Layer | Choice |
|---|---|
| Markup | Vanilla HTML |
| Styles | Single stylesheet — CSS custom properties, no preprocessor |
| Motion | CSS transitions + IntersectionObserver reveals + canvas graph |
| Hosting | Vercel (static) |
| Analytics | Vercel Web Analytics + Speed Insights (static-script injection) |

No bundler. No npm install needed to view or edit. The only devDependency (puppeteer) is for the optional `og`/`shots` tooling scripts.

> **Analytics note:** The site injects `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. These resolve only on Vercel — enable **Web Analytics** and **Speed Insights** in the project's dashboard for data to flow. Locally the scripts 404 harmlessly.

---

## Design

- **Palette:** Dark-first, technical — blue-tinted near-black layers (`#060809` → `#161b23`) with signal-cyan accent (`#22d3ee`); all text tokens contrast-checked AA+
- **Type:** Space Grotesk (geometric display) + Inter (body) + JetBrains Mono (labels/UI)
- **Textures:** CSS dot grid (with cursor-proximity glow), radial gradient mesh behind the hero, inline-SVG film grain
- **Hero:** Interactive "obsidian brain" knowledge graph — 5 organisational clusters (people / decisions / docs / agents / data) on a vanilla-canvas force layout; hover a node to light up its connections
- **Motion:** Hero word-streaming "text-generate" reveal, blur-in scroll reveals, card spotlight hovers, scroll progress bar — all vanilla, no libraries, `prefers-reduced-motion` respected throughout

> Positioning is AI-native product / agentic engineering. Content is written in generalities to respect employer IP — approach and capability themes, not internal specifics.

---

## Running locally

```bash
# Python (no install)
python3 -m http.server 8080

# Or just open index.html directly in a browser
```

> Note: absolute asset paths (`/assets/...`) require serving from the repo root (as above) rather than opening via `file://`.

## Tooling (optional)

```bash
npm install        # puppeteer, only needed for the scripts below
npm run og         # regenerate assets/og.png (1200x630 social card)
npm run shots      # screenshots at mobile/tablet/desktop widths for review
```
