# Data Model

## Catalog Manifest (`ai-catalog.json`)

Root object:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `specVersion` | String | Yes | `"1.0"` |
| `host` | Object | No | Host info (see §Host Info) |
| `entries` | Array | Yes | List of `CatalogEntry` objects |

## Catalog Entry — All Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `identifier` | String | Yes | Domain-anchored URN (see §URN Format) |
| `displayName` | String | Yes | Human-readable label |
| `type` | String | Yes | IANA media type |
| `url` | String | One of | Remote artifact URL |
| `data` | Object | One of | Inline artifact JSON (mutually exclusive with `url`) |
| `description` | String | No | Short natural-language description |
| `tags` | Array\<String\> | No | Keywords for filtering |
| `capabilities` | Array\<String\> | No | Specific tool/skill names (fast filter without full artifact fetch) |
| `representativeQueries` | Array\<String\> | No | 2–5 natural-language queries; used to build semantic embeddings |
| `version` | String | No | Artifact version |
| `updatedAt` | String | No | ISO 8601 timestamp |
| `metadata` | Map | No | Custom key-value pairs; filterable via `metadata.*` |
| `trustManifest` | Object | No | Identity & compliance — see [trust.md](trust.md) |

## URN Identifier Format

```
urn:air:<publisher>:<namespace>:<agent-name>
```

| Segment | Rule |
|---------|------|
| `urn:air` | Fixed prefix |
| `<publisher>` | FQDN (e.g. `acme.com`, `github.com`); trust anchor |
| `<namespace>` | Optional colon-separated hierarchy (e.g. `finance:trading`) |
| `<agent-name>` | Terminal short name (e.g. `assistant`) |

URNs are stable logical identifiers; physical location lives in `url`/`data`. Cross-reference `<publisher>` against `trustManifest.identity` domain for zero-trust verification.

## Host Info Object

| Field | Type | Notes |
|-------|------|-------|
| `displayName` | String | Required |
| `identifier` | String | DID or domain (e.g. `did:web:acme.com`) |
| `documentationUrl` | String | |
| `logoUrl` | String | |
| `trustManifest` | Object | Same structure as entry-level |

## Examples

### Minimal Solo Developer

```json
{
  "specVersion": "1.0",
  "host": { "displayName": "Alice's AI Tools" },
  "entries": [
    {
      "identifier": "urn:air:github.com:alice-dev:pptx-creator",
      "displayName": "pptx-creator",
      "type": "application/ai-skill+md",
      "url": "https://github.com/alice-dev/pptx-creator",
      "description": "Create professional PowerPoint presentations.",
      "representativeQueries": [
        "create a brand-compliant slide deck",
        "generate a quarterly report presentation"
      ]
    }
  ]
}
```

### MCP Server with Inline Artifact

```json
{
  "specVersion": "1.0",
  "host": { "displayName": "Alice's AI Tools" },
  "entries": [
    {
      "identifier": "urn:air:hf.co:alice-dev:weather-agent",
      "displayName": "Weather Agent",
      "type": "application/mcp-server-card+json",
      "capabilities": ["get_weather"],
      "representativeQueries": [
        "current weather in Chicago",
        "5-day forecast for Seattle"
      ],
      "data": {
        "name": "Weather Agent",
        "description": "Weather lookup using open data",
        "tools": [
          {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "inputSchema": {
              "type": "object",
              "properties": { "city": { "type": "string" } },
              "required": ["city"]
            }
          }
        ]
      }
    }
  ]
}
```

### Nested Catalog (Bundle)

```json
{
  "identifier": "urn:air:acme.com:plugin:finance-suite",
  "displayName": "Finance Tool Bundle",
  "type": "application/ai-catalog+json",
  "tags": ["finance", "bundle"],
  "data": {
    "specVersion": "1.0",
    "entries": [
      {
        "identifier": "urn:air:acme.com:finance:a2a",
        "displayName": "Finance Trading Agent",
        "type": "application/a2a-agent-card+json",
        "url": "https://api.acme.com/agents/finance-trader.json"
      }
    ]
  }
}
```

### Registering a Dynamic Registry Endpoint

```json
{
  "identifier": "urn:air:acme.com:registry:global",
  "displayName": "Acme Global Agent Registry",
  "type": "application/ai-registry+json",
  "url": "https://registry.acme.com/api/v1/",
  "description": "Dynamic REST search interface for all enterprise agents.",
  "tags": ["registry", "search"]
}
```

## Schema Validation

```bash
# Validate ai-catalog.json against the official JSON Schema
npx ajv-cli validate \
  -s spec/schemas/ai-catalog.schema.json \
  -d path/to/ai-catalog.json
```

Authoritative schemas: `spec/schemas/ard.cddl` (CDDL), `spec/schemas/ai-catalog.schema.json` (JSON Schema), `spec/schemas/ard.openapi.yaml` (OpenAPI 3.1).
