# Agent: Foundation Feedback

The improvement loop for `foundations/`. Reads conversation logs, finds what the foundations are failing to answer, and turns that into (1) a health report for leadership and (2) concrete proposal PRs. This agent **proposes; it never merges** — see `foundations/GOVERNANCE.md`.

## Trigger

Run on the cadence set in GOVERNANCE.md, or on demand: *"Run the foundation feedback loop."* Optionally scoped: *"…over logs since <date>."*

## Inputs

- `logs/*.jsonl` and `logs/**/*.jsonl` — conversation logs in the format defined in `logs/README.md`
- All files in `foundations/`
- Previous reports in `reports/` (to track whether earlier findings were addressed and avoid re-reporting accepted/rejected proposals)

## Procedure

### 1. Mine the logs

Read every in-scope log entry. Collect, with counts and log references:

- **Recurring questions** — the same underlying question asked by different users or sessions (normalize phrasing).
- **Foundations gaps** — moments where a skill reported "cannot assess — foundations gap", cited an unfilled `<!-- FILL -->`, or a user was told the foundations don't cover something.
- **Contradictions** — places users corrected the assistant ("that's not right, we actually use…"), or where two foundation files disagree.
- **Staleness signals** — mentions of systems, vendors, org structures, or processes that differ from what foundations say.
- **Unmet skill needs** — deliverables users asked for that no skill covers (report-only; skills aren't governed like foundations).

Discard one-off noise: a finding needs either ≥2 independent occurrences or a single high-severity contradiction to make the report.

### 2. Write the health report

Write `reports/foundation-health-<YYYY-MM-DD>.md`:

```
# Foundation Health Report — <date>
Logs analyzed: <n> sessions, <date range>

## Summary — top 3 findings in one line each

## Findings
### F1: <title>   (severity: high|medium|low · occurrences: n)
- Affected file/section: foundations/<file>#<section>
- Evidence: <date> — "<anonymized excerpt>" (log ref) …
- Recommendation: <propose edit (see PR) | needs owner input | monitor>

## Follow-up on previous report
- <finding> → <addressed / still open / proposal rejected>

## Unmet skill needs (informational)
```

**Anonymize evidence**: excerpts carry role/team context if useful, never names or client details.

### 3. Draft proposal PRs

For each finding where the correct edit is *clear from evidence* (a stale vendor name, a missing referral path users repeatedly described, a documented contradiction with a known resolution):

1. Branch from `main`: `foundation-proposal/<date>-<slug>`.
2. Make the minimal edit to the affected foundation file. One concern per branch (GOVERNANCE rule 4). Bump the file's `Last approved:` line only on merge — leave it; the owner does that.
3. Open a PR titled `Foundation proposal: <title>`, body containing: the finding (F-number), the evidence excerpts, and the exact reasoning from log to edit. Request review from the file's owner per CODEOWNERS.

For findings where the *right answer isn't in the logs* (users revealed a gap but not the fill), do **not** guess — mark the finding "needs owner input" in the report instead.

## Hard limits

- Never commit to `main`. Never merge anything. Never edit `foundations/` outside a `foundation-proposal/*` branch.
- Never include names, client identifiers, account details, or verbatim sensitive content in reports or PRs.
- Maximum 5 proposal PRs per run — beyond that, batch the rest into the report so owners aren't flooded.
- If `logs/` contains only the examples directory, say so and stop; don't produce a report from synthetic data (except when the user explicitly asks for a test run).
