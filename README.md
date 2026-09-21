# James Finnie

Personal site at <https://www.james-finnie.com/>.

A single static page. The opening scene flies the camera into the monitor in
the original mountain-lake studio artwork; the screen then opens out to fill
the viewport and shows an index of the site, and scrolling on carries you
straight into the page — about, selected work, experience, toolkit, contact.

The scene is a scene, not a container. Every section lives in ordinary
document flow after it, with no nested scroller, no `inert` content and no
disclosure widgets, so the page reads the same to a visitor, a crawler, a
screen reader and a printer. With motion off it is a still frame and the
links go straight to their sections.

No build step, no framework, no third-party requests. Fonts, images and the
résumé are served from this repository.

## Run

```
python3 -m http.server 8080
```

Then open <http://localhost:8080>. There is nothing to install.

## Verify

```
node --test tests/*.test.mjs
```

The suite covers the opening scene's geometry in both acts: the artwork covers
the stage at every aspect ratio, the screen stays welded to the measured
monitor aperture until the approach finishes, it then opens to exactly the
viewport without overshooting or shrinking, the camera never reverses, the
wallpaper is always gone before the screen's own page is readable, and
reduced motion holds everything still.

## Structure

- `index.html` — the whole page, plus metadata and Person structured data.
- `assets/site.css` — layout, type scale, responsive rules, motion and print.
- `assets/site.js` — motion preference, the current-section indicator, the year.
- `assets/scene.mjs` — the two-act scene geometry and its scroll loop.
- `assets/studio-world.webp` — the original studio artwork (master: `studio-world.png`).
- `assets/james-portrait.webp` — portrait (master: `james-portrait.jpeg`).
- `assets/James-Finnie-Resume.pdf` — the résumé linked from the page.
- `assets/og.jpg` — the social card. Regenerate with `npm run og`.
- `robots.txt`, `sitemap.xml`, `404.html`.

## Motion

Motion follows `prefers-reduced-motion`. Visitors can also turn it off from the
footer, which sets `?motion=quiet` so the preference survives a shared link.
With motion off the journey collapses to one viewport, the scene is a still
frame of the lit monitor, and the page is a plain document.

## Publish

Production is `main` in `JPFinnie/website`, deployed by Vercel.

`vercel.json` serves the repository root with no install or build step. It sets
a Content-Security-Policy that allows no third-party origins — the inline
structured-data block is allowed by its `sha256` hash, so **editing that block
means recomputing the hash** in `vercel.json`. `.vercelignore` keeps image
masters and tooling out of the deployment.
