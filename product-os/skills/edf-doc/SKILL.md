---
name: edf-doc
description: Generate Enterprise Delivery Framework (EDF) documents for an initiative. Use when the user asks for EDF documents, stage-gate artifacts, an initiative brief, business case, delivery plan, or asks "what do I need for the next EDF gate".
---

# EDF Document Generator

Generate the delivery-framework documents an initiative needs, exactly to the definitions in `foundations/practice-frameworks.md`.

## Before writing anything

1. Read the "Enterprise Delivery Framework" section of `foundations/practice-frameworks.md`. That file — not this skill — defines the lifecycle stages, the document set, required sections, and approvers. This skill is only the procedure for filling them in.
2. Establish from the user: which initiative, which EDF stage it's at (or approaching), and what material already exists (one-pager, PR-FAQ, six-pager, Jira epic). Reuse prior documents rather than re-asking answered questions; pull ticket context via `integrations/jira.md` if the connector is available.
3. Read `foundations/business-strategy.md` and `foundations/wealth-lobs.md` for the strategy-alignment and stakeholder sections every EDF document carries.

## Procedure

1. **Identify the required documents** for the target stage from the EDF document-set table. Tell the user which documents are due and which approvers each needs before generating anything.
2. **For each document**, follow its "Required sections" list in order. For every section:
   - Fill it from user input, prior documents, and foundations — in that priority order.
   - If the information doesn't exist yet, insert a clearly marked `> OPEN:` block stating what's needed and who likely owns the answer. Never fabricate estimates, dates, or approvals.
3. **Compliance checkpoints**: include the applicable items from "Risk & compliance checkpoints" in `practice-frameworks.md` (privacy, security, model-risk for AI features) as a checklist with status.
4. **Consistency pass**: numbers, dates, and scope statements must agree across the generated set; contradictions with an earlier-stage document are surfaced to the user, not silently resolved.

## Rules

- If the EDF section of `practice-frameworks.md` is still unfilled (`<!-- FILL -->`), stop and tell the user the framework definition is missing — offer to draft a generic stage-gate document set clearly labeled as *not* EDF-conformant, and note the gap for the foundation feedback loop.
- Approver names come from the foundations file or the user; never guess approvers.
- Output each document as a separate markdown file-ready block, titled per house convention.
