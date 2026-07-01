# Integration Contract: Email

**Status: stub — no connector wired.** When email lands (Phase 2), it is **draft-only by default**: agents prepare, humans send.

## Capabilities skills depend on

### `create_draft(to[], cc[], subject, body_markdown, attachments?)`
Create a draft in the user's own mailbox (Graph API / corporate SMTP gateway — Phase 2 decision). Returns a link to the draft.

Used by:
- Deliverable skills (`prfaq`, `one-pager`, `six-pager`, `edf-doc`) — "draft the email sending this to the review forum".
- `foundation-feedback` — draft the health-report notification to foundation owners.

### `search_threads(query, since?)` *(read — optional)*
Search the user's own mail for context (e.g. "find the thread where the pricing decision was made"). Strictly the authenticated user's mailbox; never another user's.

## Rules

1. **No autonomous sending.** `send` is not part of this contract. If a future phase adds it, it requires per-message human confirmation in the cockpit — this line is the record of that decision.
2. Drafts inherit the bank's classification labeling; deliverables containing strategy content default to internal-only classification.
3. Recipient lists come from the user or from named roles in `foundations/GOVERNANCE.md` ownership table — never inferred from directory searches.
