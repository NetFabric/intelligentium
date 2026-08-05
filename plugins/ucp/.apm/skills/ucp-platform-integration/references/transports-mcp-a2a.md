# Transports: REST, MCP, A2A, Embedded

A business may expose several transports for the same service; pick whichever fits your architecture — all carry the same UCP semantics (capabilities, status lifecycle, messages).

| Transport | Best for | Schema format |
|-----------|----------|----------------|
| REST | Server-to-server, traditional apps | OpenAPI 3.x |
| MCP | AI agents via tool-calling | OpenRPC |
| A2A | Agent-to-agent ecosystems | Agent Card Specification |
| Embedded | In-app rendered checkout UI | OpenRPC (JSON-RPC) |

## REST

- Base URL = the profile's `rest` service `endpoint` (no trailing slash); OpenAPI paths append directly, e.g. endpoint `https://business.example.com/api/v2` + path `/checkout-sessions` → `POST https://business.example.com/api/v2/checkout-sessions`.
- Standard HTTP verbs and status codes. Business *outcomes* (e.g. `out_of_stock`) return HTTP `200` with a UCP envelope and `messages` — not a 4xx.
- Headers: `UCP-Agent` (required, RFC 8941 dictionary), `Idempotency-Key` (state-changing ops — server MUST cache the result ≥24h and return `409` on reuse with different params), `Request-Id` (tracing), plus one auth mechanism (`Authorization`, `X-API-Key`, or `Signature`/`Signature-Input`/`Content-Digest`).

## MCP

Request uses `tools/call` with the operation name and UCP payload in `arguments`, plus your profile in `meta`:

```json
{ "jsonrpc": "2.0", "method": "tools/call",
  "params": { "name": "create_checkout",
    "arguments": { "meta": { "ucp-agent": { "profile": "https://agent.example/profile" } },
      "checkout": { "line_items": [ "..." ] } } },
  "id": 1 }
```

Response is dual-output: `result.structuredContent` carries the real UCP payload (validate against the tool's `outputSchema`); `result.content[]` SHOULD also carry the same payload as serialized JSON text, for clients that don't yet support structured content.

## A2A

The business exposes an A2A agent that supports UCP as an A2A Extension. The profile's `endpoint` for this transport is the Agent Card URL, not a REST base path. Use this when your own architecture is already A2A-native rather than tool-calling.

## Embedded (EP)

JSON-RPC protocol for rendering the business's own checkout UI inside your surface, with bidirectional events and payment/shipping-address delegation. Initiated via a `continue_url` the business returns; your host receives UI events and can delegate specific user actions back to the business. Use this when you want the business's own checkout experience embedded rather than driving it yourself via REST/MCP calls.

## Choosing a Transport

- Tool-calling AI agent framework → **MCP**.
- Existing server-to-server integration or traditional web/mobile app → **REST**.
- Already operating in an A2A agent ecosystem → **A2A**.
- Want the business's native checkout UI rendered in your surface (not driving it yourself) → **Embedded**.
