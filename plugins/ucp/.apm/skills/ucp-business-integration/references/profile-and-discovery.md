# Profile & Discovery

## Hosting Requirements

| Rule | Requirement |
|------|-------------|
| Transport | HTTPS only |
| Redirects | MUST NOT use 3xx redirects |
| Caching | MUST include `Cache-Control: public, max-age=<N>` with `N >= 60` |
| Forbidden directives | MUST NOT use `private`, `no-store`, or `no-cache` |
| Auth | Profile MUST be publicly accessible, no authentication |

Profile URLs represent your stable identity — they should not vary per-session or per-transaction.

## Entity Fields

Every `services`, `capabilities`, and `payment_handlers` entry shares a common shape:

| Field | Required | Notes |
|-------|----------|-------|
| `version` | Yes | `YYYY-MM-DD` |
| `spec` | Capabilities: yes; services: yes | Human-readable spec URL |
| `schema` | Capabilities: yes; services: REST/MCP/embedded | JSON Schema / OpenAPI / OpenRPC URL |
| `id` | Handlers only | Disambiguates multiple instances |
| `config` | No | Entity-specific configuration |
| `extends` | Extensions only | Parent capability name(s); array for multi-parent |
| `transport` | Services only | Enum: `rest`, `mcp`, `a2a`, `embedded` |
| `endpoint` | Services only | Base URL (REST/MCP) or Agent Card URL (A2A) |

## Namespace Governance

Capability/service names use `{reverse-domain}.{service}.{capability}` (e.g. `dev.ucp.shopping.checkout`, `com.example.payments.installments`).

| Namespace | Authority | Schema origin MUST be |
|-----------|-----------|------------------------|
| `dev.ucp.*` | UCP Tech Council | `https://ucp.dev/...` |
| `com.{vendor}.*` | Vendor | `https://{vendor}.com/...` |

Your own custom capabilities/extensions MUST live under your own reverse-domain — platforms validate this binding and reject mismatches. The `spec` (docs) URL is not authority-bound; only `schema` is.

## Negotiating With a Platform (your responsibilities)

1. Read the platform's profile URI from the `UCP-Agent` header (REST, RFC 8941 Dictionary syntax) or `meta.ucp-agent.profile` (MCP) on every request.
2. Fetch and validate the platform profile (cache per its `Cache-Control`, unless already cached).
3. Compute the capability intersection: intersect by name → for each match, select the highest mutually-supported version → prune extensions whose parent isn't in the intersection → repeat until stable.
4. Include only capabilities relevant to the current operation in your response's `ucp.capabilities` (e.g. `create_checkout` → `checkout` + its active extensions, never `cart`/`order`).
5. On failure, return the matching error (see table below) with an optional `continue_url` fallback.

## Version Negotiation

- `version` in your profile is your current protocol version (`YYYY-MM-DD`).
- Support older versions via `supported_versions: { "<old-version>": "<profile URI>" }` — each mapped URI is a self-contained, version-specific profile and MUST NOT itself declare `supported_versions`.
- On every request, validate the platform's version against `version` or a `supported_versions` key; otherwise return `version_unsupported`. Never advertise a non-dated string (e.g. `"draft"`) publicly.
- Echo the negotiated `ucp.version` in every response.

## Discovery & Negotiation Error Codes

| Code | Meaning | HTTP | JSON-RPC |
|------|---------|------|----------|
| `invalid_profile_url` | Platform's profile URL malformed/missing | 400 | -32001 |
| `profile_unreachable` | Fetch failed (timeout, non-2xx) | 424 | -32001 |
| `profile_malformed` | Fetched content invalid | 422 | -32001 |
| `version_unsupported` | Platform's protocol version not supported | 422 | -32001 |
| `capabilities_incompatible` | Empty intersection | 200 | in `result` |

Discovery/version failures are transport errors (no resource created). An empty capability intersection is a normal `200`/success-transport response carrying `ucp.status: "error"` and `messages` — both cases may include `continue_url` as a web fallback.

## Fetching Platform Profiles (defensive practices)

- Reject non-HTTPS URLs; do not follow redirects; enforce connect/response timeouts.
- Cache with a minimum TTL floor of 60s regardless of the platform's own `Cache-Control`.
- Maintain a registry of pre-approved/known platforms to serve efficiently; for unrecognized platforms, bound your own resource use with a fixed-size profile cache, a global discovery rate limit, and backoff on repeated failures — or respond `503`+`Retry-After` and resolve asynchronously.
- On signature failure with an unknown `kid`, you MAY force-refresh the cached profile, but no more than once per TTL floor per origin.

See [payments-and-signing.md](payments-and-signing.md) for how your `signing_keys` are used to sign responses/webhooks, and how you verify a platform's request signatures using the keys in its profile.
