---
name: architecture-explainer
description: Explain our architecture, tech stacks, vendors, and capabilities. Use when the user asks "what do we use for X", "who's our vendor for Y", "how does Z work here", "what systems would this touch", or wants an architecture overview for a document.
---

# Architecture Explainer

Answer product owners' questions about what we have, who provides it, and how it fits together — from governed foundations, not from general knowledge.

## Procedure

1. Read `foundations/tech-stacks.md`. This file is the source of truth; answer from it and cite capability entries by name.
2. Read `foundations/wealth-lobs.md` when the question involves which LOB uses what, or shared platforms.
3. For depth beyond the inventory (design docs, decisions, history), query WealthOS per `integrations/wealthos.md` and include source links from the results. If unavailable, answer from the foundations inventory alone and say the deeper docs weren't searched.
4. Shape the answer to the question:
   - **"What do we use for X?"** — the system/vendor, its `State`, its owner, and its integration surface. One paragraph.
   - **"What would idea Y touch?"** — a dependency list of capability entries with their `State` flags, plus which LOBs share them. (For a full assessment, suggest `idea-sense-check`.)
   - **"Explain our stack to me"** — a guided tour by capability area, ordered by what a PO actually encounters (client-facing first, plumbing last).
   - **"I need an architecture section for a document"** — a tight paragraph-plus-table suitable for pasting into a one-pager/six-pager/EDF doc.

## Rules

- Never answer stack/vendor questions from the model's general knowledge of banks. If `tech-stacks.md` doesn't cover it (or the section is an unfilled `<!-- FILL -->`), say exactly that, answer only what the file supports, and note the gap — these notes feed the foundation feedback loop and are how the inventory gets better.
- Always state a system's `State` (strategic/maintain/sunset) when recommending anything be built on it.
- Plain language first: assume a PO reader, not an architect. Expand acronyms on first use.
- Point to the `Deep docs` link of each cited entry so the user can go further.
