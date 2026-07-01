# Integration Contract: Jira

**Status: stub — no connector wired.** Skills reference the capabilities below; when a connector exists (Atlassian MCP server, REST shim, or export job), it must satisfy this contract. Until then, skills state "Jira unchecked" and continue.

## Capabilities skills depend on

### `search_issues(query, project?, limit)`
Full-text + JQL search across the wealth delivery projects.
Used by: `idea-sense-check` (prior art), `edf-doc` (existing epic context).

Returns per issue:
```json
{
  "key": "WLTH-1234",
  "summary": "…",
  "status": "…",
  "type": "Epic|Story|…",
  "resolution": "…",
  "updated": "ISO-8601",
  "url": "https://…",
  "excerpt": "matching description/comment fragment"
}
```

### `get_issue(key)`
Full issue: description, comments, links, parent/child epics. Used by `edf-doc` to pull initiative context instead of re-asking the user.

### `link_document(key, title, url)` *(write — optional, Phase 2+)*
Attach a produced deliverable back to its epic. Write access is not required for v1; if absent, skills output the link for the user to attach manually.

## Connector options (Phase 2 decision)

1. **Atlassian MCP server** — preferred if the org's Jira allows it; capabilities map 1:1.
2. **Thin REST shim** over Jira Cloud/DC API with service-account read scope.
3. **Nightly export into WealthOS** — Jira tickets are already part of the WealthOS corpus; if live search is blocked, `search_issues` can be served by WealthOS retrieval filtered to `source: jira` (staleness: up to the export interval — connector must report its data age).

## Constraints

- Read-only by default. Any write capability needs explicit enablement and audit logging.
- Service account must be scoped to the wealth projects only.
- Results may contain client references in ticket text — connectors must not be exposed to skills running outside the bank's approved environment (see routing rules in `foundations/tech-stacks.md`, AI/LLM infrastructure).
