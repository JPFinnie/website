# Foundations Governance

The files in `foundations/` are the fixed operating context for every skill and agent in Product OS. They change **only** through the process below.

## Ownership

| File | Owner (accountable) |
|---|---|
| `business-strategy.md` | <!-- FILL: exec sponsor, e.g. Head of Wealth Digital --> |
| `wealth-lobs.md` | <!-- FILL: LOB leadership delegate --> |
| `tech-stacks.md` | <!-- FILL: architecture lead --> |
| `product-design-practice.md` | <!-- FILL: head of product / head of design --> |
| `practice-frameworks.md` | <!-- FILL: delivery/EDF practice lead --> |

The repo `CODEOWNERS` file maps `foundations/` to these owners' git handles. GitHub will require their review on any PR touching this directory — that is the enforcement mechanism.

## Rules

1. **No direct commits to `main`** for anything under `foundations/`. All changes arrive as PRs.
2. **Agents never merge.** The foundation-feedback agent may open `foundation-proposal/*` branches and PRs; only a named owner merges.
3. **Skills never edit foundations.** Task skills read these files; they must not write to them, even when a user asks. Users are pointed to the proposal process instead.
4. **One concern per proposal PR.** A proposal changes one file (or one tightly-related set of sections) with the evidence attached, so owners can accept/reject cleanly.
5. **Every proposal cites evidence.** Proposals from the feedback agent must reference the log entries (date + anonymized excerpt) that motivated them. Human proposals should say what prompted the change.

## Cadence

- **Feedback loop run:** <!-- FILL: e.g. every 2 weeks, or after every 50 logged sessions --> — produces a health report in `reports/` and zero or more proposal PRs.
- **Owner review SLA:** <!-- FILL: e.g. proposals reviewed within 10 business days; stale proposals auto-closed after 30 -->
- **Full foundations review:** <!-- FILL: e.g. quarterly --> — owners re-read their file end-to-end regardless of proposals.

## What counts as a foundations change vs. not

| Change | Route |
|---|---|
| Strategy shift, new LOB relationship, vendor swap, practice change | Foundations PR, owner-approved |
| Fixing a typo / broken link in a foundation file | Foundations PR (fast-track, still owner-merged) |
| New or improved task skill in `skills/` | Normal PR, any maintainer |
| New integration contract | Normal PR, architecture lead review recommended |

## Versioning

Each foundation file carries a `Last approved:` line and owner in its header. Bump the date on every merged change. The git history is the audit trail; no separate changelog is kept.
