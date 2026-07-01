# Tech Stacks, Vendors & Capabilities

> Owner: <!-- FILL: architecture lead --> · Last approved: <!-- FILL: date -->
>
> The inventory skills use to answer "what do we have?", "who's the vendor?", and "is this technically feasible on our stack?". Organized by capability, then by LOB where stacks diverge. Keep entries short — link to deeper architecture docs (or WealthOS) rather than duplicating them.

## How to read this file

Each capability entry follows the same shape:

```
### <Capability>
- System / vendor:      what it is and who provides it (in-house | vendor name)
- Used by:              which LOBs (see wealth-lobs.md)
- Integration surface:  how other systems talk to it (API style, batch, events, none)
- State:                strategic | maintain | sunset (target date)
- Owner:                accountable team
- Deep docs:            link (SharePoint / WealthOS cluster / repo)
```

The `State` field matters most for sense-checking: building on a `sunset` system is a flag; building around a `strategic` one is the default answer.

## Core capabilities

### Client onboarding & KYC
<!-- FILL -->

### Client portal / mobile
<!-- FILL -->

### Trading & order management
<!-- FILL: per LOB if they differ (self-directed vs advisory vs institutional) -->

### Portfolio accounting & books of record
<!-- FILL -->

### Financial planning tools
<!-- FILL -->

### CRM & advisor desktop
<!-- FILL -->

### Client communications (statements, notifications, campaigns)
<!-- FILL -->

### Payments & money movement
<!-- FILL -->

### Data platform & analytics
<!-- FILL: warehouses/lakes, BI tooling, data classification rules that constrain what can leave the bank -->

### AI / LLM infrastructure
<!-- FILL: approved model providers, the in-house GPT-OSS deployment (endpoint pattern, capacity), data-classification routing rules, and the approval process for new AI use cases. Product Agents itself runs on this. -->

### Integration & middleware
<!-- FILL: ESB/API gateway/eventing standards — the "how things are allowed to talk to each other" rules -->

## Vendor register

<!-- FILL: one row per significant vendor. -->

| Vendor | What we use them for | Contract owner | Renewal | Notes |
|---|---|---|---|---|
| | | | | |

## Standing technical constraints

<!-- FILL: the rules every idea must respect — e.g. data residency (client data stays in Canada), change freezes (tax season), mainframe batch windows, approved-cloud list, mandatory security review thresholds. idea-sense-check reads this section verbatim. -->

- …
