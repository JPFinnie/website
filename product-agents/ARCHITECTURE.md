# Product Agents — Architecture & Roadmap

This document describes the full system: what exists today (v1), and the phases that turn it into the team cockpit.

## System layers

```
┌─────────────────────────────────────────────────────────────┐
│  Cockpit GUI (Phase 3)                                       │
│  chat + skill picker · foundations browser · report inbox    │
├─────────────────────────────────────────────────────────────┤
│  Provider layer (Phase 3)                                    │
│  one adapter interface → Anthropic API / OpenAI API /        │
│  in-house GPT-OSS deployment                                 │
├─────────────────────────────────────────────────────────────┤
│  Agent layer (v1 — this repo)                                │
│  foundation-feedback · deliverable-reviewer                  │
├─────────────────────────────────────────────────────────────┤
│  Skill layer (v1 — this repo)                                │
│  prfaq · one-pager · six-pager · edf-doc ·                   │
│  idea-sense-check · architecture-explainer                   │
├─────────────────────────────────────────────────────────────┤
│  Knowledge layer (v1 — this repo)                            │
│  foundations/ (leadership-owned, git-governed)               │
│  + WealthOS retrieval (Phase 2)                              │
├─────────────────────────────────────────────────────────────┤
│  Integration layer (contracts in v1, connectors in Phase 2)  │
│  Jira · email · WealthOS                                     │
└─────────────────────────────────────────────────────────────┘
```

Two principles hold at every layer:

1. **Foundations are data, skills are behavior.** Strategy, LOB maps, and stack facts live only in `foundations/`. Skills and agents reference them by path. This is what makes the leadership governance model work — there is exactly one place to control.
2. **Everything is markdown + git.** Skills are portable across any LLM runner. Governance is PRs and CODEOWNERS, not custom software. The cockpit renders and orchestrates this repo; it never becomes the source of truth.

## The feedback loop (use case 1)

```
PO conversations ──► logs/*.jsonl ──► foundation-feedback agent
                                            │
                          ┌─────────────────┴──────────────────┐
                          ▼                                    ▼
             reports/foundation-health-DATE.md    foundation-proposal/* branch → PR
                          │                                    │
                          ▼                                    ▼
                 leadership reads                 leadership merges or rejects
```

- The agent never edits `main`. Proposals are branches; the health report is informational.
- CODEOWNERS routes every `foundations/` PR to leadership reviewers.
- Cadence and thresholds are set in `foundations/GOVERNANCE.md`.
- In v1, logs are exported/dropped into `logs/` manually or by script. In Phase 3, the cockpit writes every session there automatically (or to Supabase, with a sync job producing the JSONL).

## Integrations

Each integration has a contract file in `integrations/` describing exactly what skills need from it. Skills call the *capability* ("search delivery tickets for prior art"), never a vendor API — so the connector can be a Jira MCP server, a REST shim, or a stub without touching skill files.

| Integration | Contract | v1 status | Phase 2 target |
|---|---|---|---|
| Jira | [integrations/jira.md](integrations/jira.md) | stub — skills degrade gracefully | Atlassian MCP server or REST connector |
| Email | [integrations/email.md](integrations/email.md) | stub | Corporate SMTP/Graph connector; draft-only by default |
| WealthOS | [integrations/wealthos.md](integrations/wealthos.md) | stub | Retrieval API over the existing WealthOS corpus |

### WealthOS

WealthOS is the internal LLM wiki built from SharePoint documents and Jira tickets, using TF-IDF feature extraction and Louvain community clustering (per Karpathy's approach) to organize the corpus into navigable topic clusters. For Product Agents it is a **retrieval service**: query in, top-k excerpts out, each tagged with its cluster label and source link. The `idea-sense-check` and `architecture-explainer` skills use it for prior-art and "what do we actually have" lookups. The contract file defines the exact request/response shape so the wiki side can be built/exposed independently.

## Provider abstraction (Phase 3)

v1 needs no adapter: skills are plain markdown and run wherever they're loaded (Claude Code today). The cockpit introduces a single provider interface:

```
complete(messages, tools?, system?) -> stream
```

with three implementations — Anthropic API, OpenAI API, in-house GPT-OSS (OpenAI-compatible endpoint, e.g. vLLM). Requirements that shape the design:

- **Tool calling** must work on all three (GPT-OSS via constrained/JSON tool calling).
- **Long context** for foundations + WealthOS excerpts; the cockpit assembles context per-skill rather than dumping the whole repo.
- **Logging hook**: every completion is logged to the conversation store — this is what feeds the foundation feedback loop, so it's a first-class requirement, not telemetry.
- **Data residency**: routing rules per data classification (e.g. anything containing client data → in-house GPT-OSS only) belong in this layer.

## Cockpit GUI (Phase 3)

A web app (Next.js on Vercel or internal hosting) with:

- **Chat workspace** — pick a skill (or let it auto-trigger), converse, export the deliverable.
- **Foundations browser** — read-only rendered view of `foundations/`, with "propose a change" opening a governed PR.
- **Leadership inbox** — health reports and open foundation-proposal PRs in one review queue.
- **Admin** — provider selection, integration credentials, log retention.

The cockpit reads this repo via the git host API; deploying new skills = merging markdown.

## Roadmap

| Phase | Deliverable | Definition of done |
|---|---|---|
| **1 (this repo)** | Skills + agents framework | POs produce grounded deliverables in Claude Code; feedback loop runs end-to-end on sample logs; foundations governed via CODEOWNERS |
| **2** | Live integrations | Jira connector answering prior-art queries; WealthOS retrieval endpoint serving the two lookup skills; email drafting |
| **3** | Cockpit + providers | GUI in front of the same repo; Anthropic/OpenAI/GPT-OSS switchable; automatic conversation logging feeding the loop |
| **4** | Scale-out | Per-LOB foundation overlays, usage analytics on skills, eval suite for deliverable quality |

## Security & data handling notes

- This repo's `foundations/` will contain internal strategy: keep the repo private; move to the org's git host before filling in real content.
- Real conversation logs may contain sensitive material: `logs/*.jsonl` is gitignored (only `logs/examples/` is tracked); Phase 3 moves logs to a proper store with retention rules.
- Email integration defaults to **draft-only** — a human sends.
