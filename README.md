# James Finnie

Personal site at <https://www.james-finnie.com/>.

A single static page, opening on a desk.

You arrive at the studio artwork: a monitor on an oak desk above a mountain
lake, with the instruction written on the screen. Scroll and the camera flies
into that monitor; once it has arrived, the screen opens out to fill the
viewport and you are on the page. Keep scrolling and it runs on through
about, selected work, experience, toolkit and contact.

The scene is a scene, not a container. Only the page's own opening lives
inside the screen; every section after it is in ordinary document flow, with
no nested scroller, no `inert` content and no disclosure widgets, so the page
reads the same to a visitor, a crawler, a screen reader and a printer. The
instruction on the monitor is a real link, so the screen opens on a click as
well as on a scroll, and tabbing into the page behind it opens the screen too
— focus never lands on something that cannot be seen.

With motion off there is no camera: the desk becomes a banner and the page
below it is a plain document.

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

The suite covers the scene's geometry in both acts: the artwork covers the
stage at every aspect ratio, the screen stays welded to the measured monitor
aperture until the approach finishes, it then opens to exactly the viewport
without overshooting or shrinking, the camera never reverses, the wallpaper is
always gone before the page behind it is readable, and reduced motion holds
everything still.

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
