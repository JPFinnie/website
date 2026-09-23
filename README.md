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

Past the scene, the page reacts to where the reader is and how they move:

- **Glide.** A mouse wheel no longer jumps in notches — each notch sets a
  destination and the page eases to it (trackpads are followed more tightly,
  since they already carry inertia). In-page links fly between sections
  instead of cutting, then update the URL and move focus like a link should.
  It is native scrolling underneath: keyboard, scrollbar, touch and
  find-in-page all take over instantly.
- **Section rail.** A map pinned to the right edge, one segment per section,
  sized to that section and filling as it is read. Hover to see labels; on a
  phone it lies down under the masthead as a segmented progress bar. `J` / `K`
  step between sections.
- **Masthead.** A pill slides to the section in view, and to whatever link
  the pointer is over.
- **Reveals.** Headings rise word by word from behind a mask; copy, cards and
  roles follow in a short stagger; the portrait unveils upward and then drifts
  a little slower than the page.
- **Work.** Cards are numbered, tilt toward the pointer and carry a light
  that follows it. A segmented control filters bank and independent work,
  with the cards animating (FLIP) to their new places.
- **Experience.** A hairline timeline draws itself down the roles; each
  role's marker lights as it is passed, and its dates stay pinned beside it.
- **Toolkit.** Each row is a conveyor of tags that drifts on its own, runs
  faster while the page scrolls, reverses when the reader scrolls back, and
  stops under the pointer so it can be read.
- **Contact.** The dark panel rises into place from a rounded card, the
  headline lights letter by letter as it arrives, and the buttons lean toward
  the pointer.

Nothing is hidden without JavaScript, and split headings keep their text
whole for screen readers.

With motion off there is no camera: the desk becomes a banner and the page
below it is a plain document — no glide, no reveals, no drifting.

No build step, no framework, no third-party requests. Fonts and images are
served from this repository.

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
everything still. It also covers the scroll engine: easing that is identical
at 60 and 120 Hz and never overshoots, normalised wheel deltas, bounded
section flights, and the reading line that decides which section is current.

## Structure

- `index.html` — the whole page, plus metadata and Person structured data.
- `assets/site.css` — layout, type scale, responsive rules, motion and print.
- `assets/site.js` — motion preference, wiring, the year.
- `assets/scene.mjs` — the two-act scene geometry and its scroll loop.
- `assets/glide.mjs` — the scroll engine: eased wheel, section flights, scroll velocity.
- `assets/effects.mjs` — rail, masthead pill, reveals, filter, timeline, toolkit and contact.
- `assets/studio-world.webp` — the original studio artwork (master: `studio-world.png`).
- `assets/james-portrait.webp` — portrait (master: `james-portrait.jpeg`).
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
