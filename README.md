# james-finnie.com

Personal portfolio for James Finnie — Senior Product Manager at CIBC Investor's Edge, building AI-assisted investing tools and intelligent product platforms.

**Live:** [james-finnie.com](https://www.james-finnie.com)

---

## What's here

Single-page portfolio (`index.html`) with no build step, no framework, no dependencies. Served as a static file.

**Sections:** Hero · About · Focus areas · Experience · Capabilities · Contact

---

## Stack

| Layer | Choice |
|---|---|
| Markup | Vanilla HTML |
| Styles | Inline CSS — Fraunces (variable serif) + JetBrains Mono + Outfit |
| Motion | CSS transitions + IntersectionObserver reveals |
| Hosting | Vercel (static) |
| Analytics | Vercel Web Analytics + Speed Insights (static-script injection) |

No bundler. No npm install needed to view or edit.

> **Analytics note:** The site injects `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. These resolve only on Vercel — enable **Web Analytics** and **Speed Insights** in the project's dashboard for data to flow. Locally the scripts 404 harmlessly.

---

## Design

- **Palette:** Warm paper (`#f6f4ee`) with near-black ink (`#1b1915`) and a bronze accent (`#9c6b3f`) — light, modern, editorial
- **Type:** Fraunces variable serif (optical-size aware) for display + Outfit for body + JetBrains Mono for labels/UI
- **Layout:** At-a-glance hero card, focus-area grid, experience timeline, capability columns
- **Motion:** IntersectionObserver fade-up reveals, scroll progress bar, no libraries

> Content is deliberately written in generalities to respect employer IP — capability themes and domains rather than internal specifics.

---

## Running locally

```bash
# Python (no install)
python3 -m http.server 8080

# Or just open index.html directly in a browser
```
