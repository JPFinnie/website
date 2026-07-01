# Product OS

An agentic operating system for the product team: a set of **foundational knowledge files** owned by leadership, **task skills** that product owners use to get real work done, and **agents** that keep the whole system improving from actual usage.

It runs today in [Claude Code](https://claude.com/claude-code) (or any LLM runner that can read markdown instructions), and is designed to plug into a GUI cockpit later — see [ARCHITECTURE.md](ARCHITECTURE.md) for the full vision.

## The two use cases

### 1. Leadership: fixed foundations with a feedback loop

The `foundations/` directory holds the files that define how we operate: business strategy, how the wealth lines of business interact, our tech stacks and vendors, how product and design gets done, and our practice frameworks.

These files are **deliberately fixed**. Only leadership changes them, and only when they decide to — the rules are in [foundations/GOVERNANCE.md](foundations/GOVERNANCE.md), enforced by `CODEOWNERS`.

They don't go stale, though. The [foundation-feedback agent](agents/foundation-feedback.md) periodically reads user conversation logs (`logs/`), finds the questions people keep asking, the gaps, and the contradictions, then:

1. writes a **foundation health report** into `reports/`, and
2. drafts **concrete proposed edits** to foundation files on a `foundation-proposal/*` branch, opened as a PR.

Leadership merges or rejects. Git is the governance mechanism — no proposal touches `main` without their approval.

### 2. Product owners: getting work done

The `skills/` directory holds task skills a PO invokes to produce deliverables and answers:

| Skill | What it does |
|---|---|
| [`prfaq`](skills/prfaq/SKILL.md) | Working-backwards PR-FAQ for a new idea |
| [`one-pager`](skills/one-pager/SKILL.md) | One-page problem/opportunity brief |
| [`six-pager`](skills/six-pager/SKILL.md) | Narrative six-pager for a decision meeting |
| [`edf-doc`](skills/edf-doc/SKILL.md) | Enterprise Delivery Framework document set |
| [`idea-sense-check`](skills/idea-sense-check/SKILL.md) | Stress-test an idea against strategy, LOBs, and tech reality |
| [`architecture-explainer`](skills/architecture-explainer/SKILL.md) | Answer "what's our stack/vendor/capability for X?" |

Every skill loads the relevant `foundations/` files first, so every deliverable is grounded in leadership's context — not in whatever the model happens to remember.

## Directory map

```
foundations/    Leadership-owned knowledge. Fixed. Changed only via governed PRs.
skills/         PO task skills (Claude Code SKILL.md format). Behavior, never strategy content.
agents/         Agent definitions: the feedback loop and the deliverable reviewer.
integrations/   Interface contracts for Jira, email, and WealthOS. Stubs today, connectors later.
logs/           Conversation logs that feed the feedback loop (real logs are gitignored).
reports/        Output of the foundation-feedback agent.
```

**Design rule: foundations are data, skills are behavior.** Task skills never embed strategy or stack facts inline; they reference `foundations/` files by path. Leadership updates one file and every skill picks it up.

## Installing in Claude Code

Option A — symlink the skills into your personal skills directory:

```bash
git clone <this-repo> ~/product-os
mkdir -p ~/.claude/skills
for s in ~/product-os/skills/*/; do ln -s "$s" ~/.claude/skills/$(basename "$s"); done
```

Option B — work inside the repo. Clone it and run `claude` from the repo root; project-level skills are picked up from `.claude/skills/` if you symlink `skills/*` there instead.

Either way, skills resolve foundation files relative to the repo root, so keep the clone intact.

## Quick start

1. Leadership fills in the `<!-- FILL: ... -->` placeholders in `foundations/*.md` (each file has a worked example showing the expected shape).
2. A PO opens Claude Code and says: *"Sense-check this idea: …"* or *"Draft a PR-FAQ for …"* — the matching skill triggers, loads foundations, and produces the deliverable.
3. Conversation logs accumulate in `logs/` (see [logs/README.md](logs/README.md) for format).
4. On a cadence (see GOVERNANCE.md), run the foundation-feedback agent: *"Run the foundation feedback loop over the latest logs."*
5. Leadership reviews the health report and merges/rejects proposal PRs.

## Status

v1 — the skills/agents framework. Integrations are interface stubs; the cockpit GUI and provider abstraction layer are the next phases. Roadmap in [ARCHITECTURE.md](ARCHITECTURE.md).
