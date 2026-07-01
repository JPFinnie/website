# Conversation Logs

Input to the [foundation-feedback agent](../agents/foundation-feedback.md). Drop exported session logs here as `.jsonl` files (one JSON object per line, one object per session).

**Real logs are gitignored** (`logs/*.jsonl`, `logs/**/*.jsonl` except `examples/`) — they may contain sensitive material and must not be committed to a shared repo. In v1 they're exported here manually or by script; Phase 3 has the cockpit write them automatically.

## Format

One session per line:

```json
{
  "session_id": "uuid-or-any-unique-id",
  "ts": "2026-06-30T14:12:00Z",
  "user_role": "PO | designer | leadership | other",
  "user_team": "free text, optional",
  "skill": "prfaq | one-pager | six-pager | edf-doc | idea-sense-check | architecture-explainer | none",
  "turns": [
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" }
  ],
  "flags": ["foundations-gap", "user-correction", "unmet-skill-need"]
}
```

Field notes:

- `user_role` / `user_team` — enough context for the feedback agent to weigh evidence ("three different teams asked this"), no names required. Strip user identities on export.
- `skill` — which skill (if any) handled the session; `none` for free-form conversations.
- `turns` — may be the full transcript or a condensed version; the feedback agent needs enough text to find questions, corrections, and gaps.
- `flags` — optional hints set at export time or by the skills themselves (skills are instructed to note foundations gaps explicitly, which makes them easy to flag here). The feedback agent does not rely on flags — it mines the transcript regardless — but flags improve recall.

## Examples

`examples/sample-log.jsonl` is a synthetic log exhibiting each signal type (recurring question, foundations gap, user correction, unmet skill need). Use it to test the feedback loop: *"Run the foundation feedback loop over logs/examples/ as a test run."*
