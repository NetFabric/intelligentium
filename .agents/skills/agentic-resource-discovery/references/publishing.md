# Publishing

## Step 1 — Create the Manifest

Minimum viable `ai-catalog.json`:

```json
{
  "specVersion": "1.0",
  "host": { "displayName": "My AI Tools" },
  "entries": [
    {
      "identifier": "urn:air:example.com:server:my-tool",
      "displayName": "My Tool",
      "type": "application/mcp-server-card+json",
      "url": "https://api.example.com/mcp/my-tool.json",
      "capabilities": ["MyTool"],
      "description": "One-line description of what the tool does.",
      "representativeQueries": [
        "natural language query that matches this tool",
        "another example query"
      ]
    }
  ]
}
```

Key rules:
- `identifier` — `urn:air:<your-domain>:<namespace>:<name>`; `<your-domain>` must be an FQDN you control
- `representativeQueries` — 2–5 examples; directly fed into semantic vector embeddings used for search ranking
- `url` XOR `data` — exactly one per entry

## Step 2 — Host the Manifest

Upload to:

```
https://<your-domain>/.well-known/ai-catalog.json
```

Required HTTP response headers:

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Access-Control-Allow-Origin` | `*` (required for crawlers) |
| Protocol | HTTPS only |

## Step 3 — Alternate Discovery Mechanisms (Optional)

### Well-Known URI (primary)

```
https://example.com/.well-known/ai-catalog.json
```

### Agentmap in robots.txt

```
Agentmap: https://example.com/catalog.json
```

### HTML Link Tag

```html
<link rel="ai-catalog" href="https://example.com/catalog.json">
```

### DNS — Static Catalog (TXT)

For when `.well-known` hosting is not possible (e.g., static S3 bucket or GitHub Pages):

| Name | Type | Value |
|------|------|-------|
| `_catalog._agents.example.com` | `TXT` | `url=https://bucket.s3.amazonaws.com/ai-catalog.json` |

### DNS — Dynamic Registry (SRV)

Points to a live `POST /search` endpoint:

| Name | Type | Port | Target |
|------|------|------|--------|
| `_search._agents.example.com` | `SRV` | `443` | `search.example.com` |

## Registry Ingestion

Registries index catalogs via:

| Pipeline | Required |
|----------|----------|
| Web crawl of `ai-catalog.json` | Yes — all ARD implementations |
| Git repo scanning | Optional |
| npm / OCI registry scanning | Optional |

Publishing makes resources _potentially_ discoverable; each registry decides independently what it indexes.

## Enterprise vs. Public Publishing

| Scenario | Typical approach |
|----------|----------------|
| Public internet | Host at `.well-known`; rely on public crawlers |
| Enterprise internal | Register directly with internal registry; open-web crawling often not used |
| Vendor catalog | Vendor feed to customer registries; ARD manifest still useful for interop |
