# james-finnie.com

Personal portfolio for James Finnie — Senior Product Manager at CIBC Investor's Edge, building AI-assisted investing tools and intelligent product platforms.

**Live:** [james-finnie.com](https://www.james-finnie.com)

---

## What's here

Single-page portfolio (`index.html`) with no build step, no framework, no dependencies. Served as a static file.

**Sections:** Hero · Thesis · Selected Work · Systems · About · Experience · Currently · Writing · Contact

---

## Stack

| Layer | Choice |
|---|---|
| Markup | Vanilla HTML |
| Styles | Inline CSS — Fraunces (variable serif) + JetBrains Mono + Outfit |
| Motion | CSS transitions + IntersectionObserver reveals + SVG stroke animation |
| Hosting | Vercel (static) |

No bundler. No npm install needed to view or edit.

---

## Projects featured

| Project | Description | Link |
|---|---|---|
| **Signal** | AI agent that ingests product feedback from Slack, GitHub, and support channels — clusters intent and drafts epics | [product-plum-nu.vercel.app](https://product-plum-nu.vercel.app) |
| **Prism** | Portfolio intelligence tool — deterministic solver surfaces the single highest-EV move for self-directed investors | [portfoliiointeligence.vercel.app](https://portfoliiointeligence.vercel.app) |
| **DICOM Viewer** | Browser-native CT scan viewer built in under an hour to read my own surgical scans — zero server, open source | [imaging-umber.vercel.app](https://imaging-umber.vercel.app) |

---

## Design

- **Palette:** Near-black (`#050505`) with warm gold accent (`#c8a87c`)
- **Type:** Fraunces variable serif (optical-size aware) + JetBrains Mono for labels/UI
- **Motifs:** Decision-grid background, custom gold cursor, live market ticker in hero
- **Motion:** IntersectionObserver reveals, SVG edge-draw animations, no libraries

---

## Running locally

```bash
# Python (no install)
python3 -m http.server 8080

# Or just open index.html directly in a browser
```
