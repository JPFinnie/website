# james-finnie.com

James Finnie’s personal portfolio: product judgement, hands-on building, and work across AI, investing, and connected systems.

**Live:** [www.james-finnie.com](https://www.james-finnie.com/)

## Structure

A static, responsive site with no build step and no runtime dependencies.

- `index.html` — content, navigation, search metadata, and structured data.
- `assets/styles.css` — shared design tokens, responsive layouts, motion, and print styles.
- `assets/main.js` — mobile navigation, Toronto time, scroll progress, and Vercel analytics.
- `assets/explorer.js`, `assets/explorer.css` — the interactive portfolio map and its public-content dataset.
- `assets/fonts/` — self-hosted Space Grotesk, Inter, and JetBrains Mono.
- `assets/six-cut.webp`, `assets/finance-hermes.webp` — screenshots of the public project story and research interface.
- `assets/favicon.svg`, `assets/og.png` — identity and social preview.
- `tools/screenshot.mjs` — responsive screenshots and interaction checks.
- `tools/og-image.mjs` — social preview generator.
- `vercel.json` — security and caching headers.

The Six Cut card leads to its working project story. Its original app link is retained; the live directory displayed an empty-data state during the September 2026 review.

The page opens with an interactive map, then selected projects, then covers approach, focus areas, experience, education, and contact. Existing section links, including `#focus` and `#capabilities`, remain usable. Employer content stays at the level of public roles and approach; the showcased products are independent projects.

## The interactive field guide

The opening is a small product in its own right: 12 nodes and 21 connections between James’s public roles, independent projects, and product ideas.

- Select a node to see its story and follow related connections.
- Filter by projects, experience, or ideas; switch between map and list views.
- Search the public content, with `/` to focus search and Enter to open a result.
- Follow three guided trails: Idea → product, AI that shows its work, and Building trust.
- Rearrange nodes with a mouse or pen, pan the background, and use zoom/reset controls.
- On touch screens, the map focuses on a smaller set of connections and selected details come into view. All selection and navigation also work with the keyboard.

This is a curated, local explorer, not an LLM chat. Searches stay in the browser; no private employer material or generated claims are involved. The conventional portfolio remains below, and is fully usable without JavaScript. Reduced motion disables the animated connection lines.

## Design

Oversized geometric type with an italic serif accent, neutral paper, dark ink, and vivid orange. Real project screenshots carry the work section; alternating light, dark, and orange sections give the page a clear rhythm. Motion is limited to a short entrance and hover feedback, with reduced-motion support. The explorer adds restrained animated connection lines, with reduced-motion support. Core content is visible without JavaScript.

All fonts, CSS, JavaScript, and project screenshots are served locally. There is no CDN, WebGL, or animation-library dependency.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Serve from the repository root so absolute asset paths resolve correctly.

## Verify

```bash
npm install
npm run shots
```

The browser check starts its own server, applies the production content-security policy, and checks mobile, tablet, and desktop layouts; page errors; missing assets; internal links; mobile-menu behaviour; focus return; disclosures; explorer search, selection, guided trails, drag and zoom; reduced motion; and JavaScript-disabled content. Screenshots go to the ignored `shots/` directory.

Optional environment variables:

- `CHROME_PATH` — use an existing Chromium executable.
- `CHROME_ARGS` — JSON array of additional browser launch arguments, for constrained environments.
- `SHOTS_DIR` — choose the screenshot destination.

```bash
npm run og
```

Regenerates the existing social preview at 1200 × 630.

## Deploy

The existing Vercel project serves the repository root directly; no framework migration, environment variables, or build command is needed. Branch deployments can be reviewed before merging into the production branch.

Vercel Web Analytics and Speed Insights are retained and loaded only on HTTPS hosts. Enable those products in Vercel for their endpoints to resolve; they are not requested from the local preview server.
