# Integration Contract: WealthOS

**Status: stub — retrieval endpoint not yet exposed.** WealthOS is the internal LLM wiki built from SharePoint documents and Jira tickets: documents are vectorized with TF-IDF and organized into topic communities via Louvain clustering, giving the corpus a navigable cluster structure. For Product OS, WealthOS is a **retrieval service**.

## Capability skills depend on

### `retrieve(query, k=8, filters?)`

Used by: `idea-sense-check` (prior art), `architecture-explainer` (deep docs), `edf-doc` (initiative history).

Request:
```json
{
  "query": "advisor onboarding automation prior attempts",
  "k": 8,
  "filters": { "source": ["sharepoint", "jira"], "cluster": null, "updated_after": null }
}
```

Response, per result:
```json
{
  "excerpt": "…the relevant passage…",
  "score": 0.83,
  "cluster": { "id": 14, "label": "onboarding & KYC" },
  "source": { "type": "sharepoint|jira", "title": "…", "url": "https://…", "updated": "ISO-8601" }
}
```

Requirements on the endpoint:
- **Cluster labels are part of the contract** — skills use them to tell the user *which area* of the corpus answered ("this comes from the onboarding & KYC cluster"), which is the main navigability win of the Louvain structure.
- **Source links always present** — skills must let users verify; excerpts without provenance are unusable in governed documents.
- Results carry `updated` so skills can flag stale evidence.

### `clusters()` *(optional)*
List cluster ids/labels/sizes — lets `architecture-explainer` offer a map of what the corpus covers.

## How skills behave without the connector

State in one line that WealthOS was not searched, mark prior-art/deep-doc dimensions as "unchecked", and continue. Never simulate results.

## Exposure options (Phase 2 decision)

1. Wrap the existing WealthOS index in a small internal HTTP service implementing `retrieve`.
2. Expose it as an MCP server so Claude Code (and later the cockpit) call it natively.
3. Interim: a CLI on the index that skills invoke locally where the index file is available.

## Constraints

- The corpus contains internal documents and ticket text: the endpoint stays inside the bank network; routing rules in `foundations/tech-stacks.md` (AI/LLM infrastructure) apply to any model that sees results.
- Refresh cadence of the underlying SharePoint/Jira ingest must be reported by the endpoint (`data_age`), so skills can qualify findings.
