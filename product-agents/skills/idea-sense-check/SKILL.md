---
name: idea-sense-check
description: Stress-test a product idea against strategy, LOB impact, and technical reality. Use when the user asks to sense-check, sanity-check, pressure-test, or "does this idea make sense" — before any document gets written.
---

# Idea Sense-Check

Give a PO an honest, fast read on an idea *before* they invest in documents. The output is an assessment, not a deliverable — and not a yes-machine: a sense-check that never says "weak" is worthless.

## Procedure

1. **Restate the idea** in two sentences (client, problem, proposed direction). Confirm with the user if your restatement changed their meaning.
2. **Strategy fit** — against `foundations/business-strategy.md`:
   - Which pillar/priority does it ladder to? Directly, indirectly, or none?
   - Does it collide with any constraint or "what we say no to" entry? Quote the entry if so.
3. **LOB impact** — against `foundations/wealth-lobs.md`:
   - Sponsoring LOB, affected LOBs, shared platforms touched.
   - Does it cross a known friction point or referral path? Name it.
4. **Technical reality** — against `foundations/tech-stacks.md`:
   - Which capability entries does it depend on? Note each entry's `State` — building on `sunset` systems is a flag; missing capabilities are a bigger one.
   - Which standing technical constraints apply?
5. **Prior art** — query WealthOS (`integrations/wealthos.md`) and Jira (`integrations/jira.md`) for previous attempts, related tickets, or existing solutions. If connectors are unavailable, state that prior art is unchecked — this is a real limitation of the assessment, say it plainly.
6. **Compliance surface** — which checkpoints from `foundations/practice-frameworks.md` "Risk & compliance checkpoints" would trigger.

## Output format

```
## Sense-check: <idea title>

**Verdict:** Pursue / Pursue with changes / Park / Conflicts with standing decisions

**Strategy fit:**    <strong|partial|none> — <one line, citing pillar/priority>
**LOB impact:**      <clean|crosses friction points> — <one line>
**Tech feasibility:** <builds on strategic systems|touches sunset systems|needs new capability> — <one line>
**Prior art:**       <found: …|none found|unchecked (connector unavailable)>
**Compliance:**      <checkpoints triggered>

**The three questions that decide this idea:**
1. …

**If you proceed:** <the smallest next step, from the idea-to-delivery path in product-design-practice.md>
```

## Rules

- Verdicts must be earned: cite the specific foundation lines behind each rating. "Park" and "Conflicts" verdicts require quoting the conflicting entry.
- Where a foundation section you needed is an unfilled `<!-- FILL -->` placeholder, rate that dimension "cannot assess — foundations gap" and name the file. These gaps feed the foundation feedback loop; do not fill them from general knowledge.
- Keep the whole assessment under a page. The value is speed and honesty, not thoroughness theater.
