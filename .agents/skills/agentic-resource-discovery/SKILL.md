---
name: agentic-resource-discovery
description: "Open specification (ARD v0.9) for publishing, discovering, and verifying AI capabilities (MCP servers, A2A agents, skills, APIs) across federated networks. USE FOR: creating ai-catalog.json manifests; catalog entry schema; URN identifier format (urn:air:<publisher>:<namespace>:<name>); hosting at /.well-known/ai-catalog.json; DNS discovery (TXT/SRV records); Agentmap robots.txt directive; POST /search API; POST /explore API; GET /agents list API; federation modes (auto, referrals, none); trustManifest with SPIFFE/DID/attestations; representativeQueries for semantic search; building ARD registry clients; querying discovery services at runtime. DO NOT USE FOR: implementing MCP server tools (use MCP docs); implementing A2A agent cards (use A2A spec); OAuth/OIDC authentication."
---

# Agentic Resource Discovery (ARD)

ARD v0.9 (Draft) — federated open specification for cataloging, discovering, and verifying agentic resources. Developed by Microsoft, Google, Hugging Face, and others. Apache 2.0.

## Core Concepts

| Term | Definition |
|------|-----------|
| Catalog | Static `ai-catalog.json` manifest hosted on a domain |
| Registry | Searchable service that crawls & indexes catalogs |
| Entry | Single capability record within a catalog |
| Federation | Registry-to-Registry routing (auto / referrals / none) |
| trustManifest | Cryptographic identity & compliance metadata per entry |

## Publish in 3 Steps

1. Create `ai-catalog.json` with entries → [references/data-model.md](references/data-model.md)
2. Host at `https://<domain>/.well-known/ai-catalog.json` (HTTPS, `Content-Type: application/json`, CORS `*`) → [references/publishing.md](references/publishing.md)
3. (Optional) Add DNS `TXT`/`SRV` records for alternate paths → [references/publishing.md](references/publishing.md)

## Catalog Entry — Required Fields

| Field | Type | Rule |
|-------|------|------|
| `identifier` | String | `urn:air:<publisher>:<namespace>:<name>`; `<publisher>` must be FQDN |
| `displayName` | String | Human-readable label |
| `type` | String | IANA media type (see table below) |
| `url` **or** `data` | String / Object | Exactly one; mutually exclusive |

## Common `type` Values

| Type | Resource |
|------|---------|
| `application/mcp-server-card+json` | MCP server |
| `application/a2a-agent-card+json` | A2A agent |
| `application/ai-skill+md` | Copilot skill |
| `application/ai-catalog+json` | Nested / linked catalog |
| `application/ai-registry+json` | Dynamic registry search endpoint |

## ARD API at a Glance

| Endpoint | Required | Use |
|----------|----------|-----|
| `POST /search` | Yes | Semantic search; returns ranked entries + optional referrals |
| `POST /explore` | No | Faceted aggregation (counts by type, publisher, …) |
| `GET /agents` | No | Deterministic paginated listing with filter/orderBy |

Full schemas → [references/api.md](references/api.md)

## Federation Modes (`federation` field in `POST /search`)

| Mode | Behavior |
|------|---------|
| `auto` | Registry merges upstream results transparently |
| `referrals` | Returns local results + referral registry entries for client-directed follow-up |
| `none` | Scoped to queried registry only |

## Reference Files

| File | Load When |
|------|-----------|
| [references/data-model.md](references/data-model.md) | Full catalog schema, URN format, optional fields, nested catalog examples |
| [references/api.md](references/api.md) | Search / Explore / List request & response JSON schemas |
| [references/publishing.md](references/publishing.md) | Hosting, DNS TXT/SRV, Agentmap, robots.txt, HTML link tag |
| [references/trust.md](references/trust.md) | trustManifest object, SPIFFE, DID, attestations, provenance, signatures |
