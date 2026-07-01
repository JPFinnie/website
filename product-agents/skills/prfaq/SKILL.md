---
name: prfaq
description: Draft a working-backwards PR-FAQ for a product idea. Use when the user asks for a PR-FAQ, press release, or "working backwards" document for an idea, feature, or initiative.
---

# PR-FAQ Generator

Produce an Amazon-style working-backwards PR-FAQ, grounded in this organization's strategy and frameworks.

## Before writing anything

1. Read `foundations/business-strategy.md` — the idea must be framed against the pillars and current-year priorities; note any constraint or "we say no to" entry it touches.
2. Read `foundations/wealth-lobs.md` — identify the sponsoring LOB, affected LOBs, and any shared-platform or referral-path implications.
3. Read the "PR-FAQ" section of `foundations/practice-frameworks.md` — apply every house adaptation and include every house-mandatory FAQ question listed there.
4. If prior art matters (it usually does), query WealthOS and Jira per `integrations/wealthos.md` and `integrations/jira.md`. If those connectors aren't available, say so in one line and continue — never invent prior art.

If the user's idea is missing essentials (target client, the problem, rough scope), ask for them before drafting. A PR-FAQ built on guesses wastes a review cycle.

## Document structure

**Page 1 — Press release** (max 1 page, written as if at launch):
- Headline: customer-benefit phrasing, no internal jargon
- Subheading: who it's for and the single biggest benefit
- Opening paragraph: what launched, for whom, why it matters — a journalist could reprint it
- Problem paragraph: the client's pain today, with evidence if available
- Solution paragraph: how it works from the client's point of view
- Leader quote (sponsoring LOB voice) and customer quote (realistic, specific)
- How to get started

**Pages 2+ — FAQ:**
- *Customer FAQs*: the 5–8 hardest questions a real client or advisor would ask
- *Internal FAQs*, always including:
  - Which strategic pillar/priority does this ladder to? (cite `business-strategy.md`)
  - Which LOBs are affected and who is the sponsor? (cite `wealth-lobs.md`)
  - What does this depend on technically? (cite `tech-stacks.md` entries by name; flag anything with `State: sunset`)
  - What are the regulatory/compliance checkpoints? (from `practice-frameworks.md`)
  - What would make us kill this?
  - All house-mandatory questions from `practice-frameworks.md`

## Rules

- Write in plain prose. No marketing superlatives, no "revolutionary".
- Every claim that depends on org context must trace to a foundation file; where a foundation file has an unfilled `<!-- FILL -->` placeholder in a section you needed, note the gap explicitly in the FAQ rather than inventing an answer — these notes feed the foundation feedback loop.
- End with a one-line suggested next step from the idea-to-delivery path in `foundations/product-design-practice.md`.
- Never edit foundation files, even if the user asks — point them to `foundations/GOVERNANCE.md`.
