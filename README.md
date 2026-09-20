# James Finnie

Personal website at https://www.james-finnie.com/.

This repository contains the complete Toronto portfolio: original photographs, locally hosted fonts, and the scroll-to-computer interaction. About and contact are directly accessible; experience and approach use native disclosures. Reduced motion is supported. No Pace or initials logo appears in the page.

## Run

Serve the repository root with `python3 -m http.server 8080`, then open http://localhost:8080. No install or build step is needed.

## Verify

Run `node --test tests/*.test.mjs` for responsive geometry and reduced-motion checks.

## Publish

Production source: `main` in `JPFinnie/website`. The root `index.html` and `assets/` contain the actual site; there is no dependency on ChatGPT Sites or its sign-in service.

`vercel.json` selects a static deployment from the repository root, without an install or build step. It contains security and revalidation headers and no external redirects. A connected host should deploy the latest `main` commit.

## Files

- `index.html`: content and metadata.
- `assets/gallery.css`: responsive layout and motion preferences.
- `assets/gallery.js`: disclosures, photo dialog, and navigation.
- `assets/scene.mjs`: scroll transition and focus handling.
- `assets/toronto-james-finnie.jpeg`: original Toronto photograph.
- `assets/james-portrait.jpeg`: original portrait.
- `assets/studio-foreground.png`: monitor foreground.

Legacy assets and optional tooling are retained but are not loaded by the current page.
