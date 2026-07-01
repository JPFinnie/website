---
name: six-pager
description: Draft a narrative six-pager for a decision meeting. Use when the user asks for a six-pager, decision memo, or narrative document to secure funding or a go/no-go.
---

# Six-Pager Generator

Produce a narrative memo that lets a decision forum read silently for 20 minutes and then decide. This is the "Shape → Commit" artifact: it exists to get a decision, not to describe work.

## Before writing anything

1. Read `foundations/business-strategy.md`, `foundations/wealth-lobs.md`, and the relevant capability entries in `foundations/tech-stacks.md` — a six-pager makes claims about strategy fit, LOB impact, and feasibility, and all three must trace to foundations.
2. Read `foundations/practice-frameworks.md` "Six-pager" section for house adaptations (required appendices, financial table formats, page rules) and `foundations/product-design-practice.md` for the decision forum this document goes to.
3. Ask the user for the decision being sought if it isn't stated. A six-pager without a decision is a status report.

## Default structure (six pages of prose; data tables go to appendices)

1. **The decision we're asking for** — first paragraph, no throat-clearing.
2. **Context** — the client problem and market/regulatory backdrop; evidence over adjectives.
3. **Options considered** — including "do nothing", each with its honest best case.
4. **Recommendation** — the chosen option and the reasoning that survives the strongest counterargument.
5. **Plan & economics** — phased plan mapped to the EDF stages in `practice-frameworks.md`, order-of-magnitude costs/benefits with arithmetic shown, key dependencies citing `tech-stacks.md` entries by name (flag any `State: sunset` dependency).
6. **Risks & what we'd see if we're wrong** — top risks with owners, leading indicators, and pre-agreed kill criteria.

**Appendices** (not counted in the six pages): financial detail, research summaries, technical assessment, compliance checkpoints from `practice-frameworks.md`.

## Rules

- Narrative prose throughout — no bullet-point decks in memo clothing. (Bullets are acceptable only in appendix tables.)
- Steelman the opposition: section 4 must state the best argument against the recommendation and answer it.
- Every org-specific claim cites its foundation file; unfilled `<!-- FILL -->` sections you depended on are flagged as open questions, never papered over.
- Respect page discipline: if the draft exceeds six pages, cut content rather than shrinking the argument's honesty.
