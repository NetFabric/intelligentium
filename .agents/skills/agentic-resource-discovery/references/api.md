# ARD API

Base URL discovered from `application/ai-registry+json` entries in `ai-catalog.json`.

## Query Model (shared by Search & Explore)

```json
{
  "query": {
    "text": "find me a flight booking agent",
    "filter": {
      "type": ["application/a2a-agent-card+json"],
      "tags": ["travel"],
      "trustManifest.attestations.type": ["SOC2-Type2"]
    }
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `text` | See per-endpoint | Natural-language intent; drives semantic ranking |
| `filter` | No | Dot-separated field paths; array values are OR; across keys is AND |

Filter keys: any catalog field (`type`, `tags`, `capabilities`, `publisher`, `version`, `metadata.*`, Schema.org fields, `trustManifest.*`). `publisher` is derived from the URN's `<publisher>` segment.

## POST /search — Required

Semantic search; `text` is required.

**Request:**

```json
{
  "query": {
    "text": "flight booking agent",
    "filter": { "type": ["application/a2a-agent-card+json"] }
  },
  "federation": "referrals",
  "pageSize": 10,
  "pageToken": "eyJwYWdlIjogMn0="
}
```

| Field | Default | Notes |
|-------|---------|-------|
| `federation` | `auto` | `auto` / `referrals` / `none` |
| `pageSize` | 10 | Max 100 |
| `pageToken` | — | Cursor for next page |

**Response:**

```json
{
  "results": [
    {
      "identifier": "urn:air:acme.com:agent:assistant",
      "displayName": "Corporate Assistant",
      "type": "application/a2a-agent-card+json",
      "url": "https://api.acme.com/agents/assistant.json",
      "score": 95,
      "source": "https://registry.acme.com/api/v1/"
    }
  ],
  "referrals": [
    {
      "identifier": "urn:air:nlweb.ai:registry:public",
      "displayName": "Public Agent Finder",
      "type": "application/ai-registry+json",
      "url": "https://finder.nlweb.ai/search"
    }
  ],
  "pageToken": "eyJwYWdlIjogMn0="
}
```

- `score` — semantic relevance 0–100; **not** a trust or safety rating.
- `referrals` — only present when `federation: "referrals"`.
- `source` — registry URL that produced the result.

## POST /explore — Optional

Faceted aggregation over matched set; `text` and `filter` both optional (omit → aggregate entire registry).

**Request:**

```json
{
  "query": {
    "text": "currency conversion",
    "filter": { "trustManifest.attestations.type": ["SOC2-Type2"] }
  },
  "resultType": {
    "facets": [
      { "field": "type" },
      { "field": "publisher", "limit": 50 }
    ]
  }
}
```

Each facet element:

| Field | Required | Notes |
|-------|----------|-------|
| `field` | Yes | Field path (same syntax as filter) |
| `limit` | No | Max buckets; default 20 |
| `minCount` | No | Suppress buckets below threshold |

**Response:**

```json
{
  "resultType": "facets",
  "facets": {
    "type": {
      "buckets": [
        { "value": "application/mcp-server-card+json", "count": 1247 },
        { "value": "application/a2a-agent-card+json",  "count": 389 }
      ],
      "otherCount": 23
    },
    "publisher": {
      "buckets": [
        { "value": "acme.com", "count": 412 }
      ]
    }
  }
}
```

Explore does **not** federate. Returns `501` if not implemented.

## GET /agents — Optional

Deterministic paginated listing; no semantic ranking.

| Parameter | Notes |
|-----------|-------|
| `filter` | EBNF filter expression (see Appendix A of spec) |
| `orderBy` | e.g. `name`, `created_at DESC` |
| `pageSize` | Default 20, max 100 |
| `pageToken` | Cursor |

Common filter fields: `displayName` (case-insensitive), `type` (comma-sep OR), `publisherId` (comma-sep OR), `createdAfter`, `updatedAfter`.

## Protocol Wrappers (Optional)

A registry MAY expose search as an MCP Tool or A2A Skill. Response format must match catalog entry structure; request format is protocol-specific.

## Standard Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `INVALID_ARGUMENT` | Malformed query or filter |
| 401 | `UNAUTHENTICATED` | Missing/invalid credentials |
| 404 | `NOT_FOUND` | No such agent or registry |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Registry-side failure |
| 501 | — | Endpoint not implemented (Explore / List) |

## Conformance Testing

```bash
# Validate a local manifest
./conformance/bin/conformance-test manifest path/to/ai-catalog.json

# Validate a live registry
./conformance/bin/conformance-test registry http://localhost:9010/api

# End-to-end demo
./conformance/bin/run-conformance-demo
```
