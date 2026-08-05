---
name: ucp-platform-integration
description: "Consume the Universal Commerce Protocol (UCP) as a platform, app, or AI agent: discover business capabilities via /.well-known/ucp, negotiate protocol/capability versions, send the UCP-Agent header, drive the checkout session lifecycle (create/get/update/complete/cancel), process status/messages/continue_url handoff, acquire and submit payment instruments (digital wallets, tokenization, AP2 mandates), sign requests (RFC 9421), and call UCP over REST, MCP, A2A, or Embedded transports. USE FOR: building an AI shopping agent, app, or procurement system that discovers and transacts with UCP businesses; capability negotiation and version-matching logic; checkout status/error handling; payment handler execution; choosing between REST/MCP/A2A/Embedded bindings. DO NOT USE FOR: implementing a UCP business/merchant server (see ucp-business-integration); generic MCP or A2A protocol usage unrelated to commerce; non-UCP payment processing."
---

# UCP Platform Integration

UCP lets a platform (AI shopping agent, app, procurement system) discover any business's checkout/cart/order capabilities from one machine-readable profile and transact — no bespoke integration per business.

## Anatomy

| File | Purpose |
|------|---------|
| SKILL.md | Roles, negotiation flow, checkout quick-reference |
| [references/discovery-and-negotiation.md](references/discovery-and-negotiation.md) | Fetching profiles, capability intersection, namespace validation, schema resolution |
| [references/checkout-flow.md](references/checkout-flow.md) | Operations, status lifecycle, error processing, totals, continue_url |
| [references/payments-execution.md](references/payments-execution.md) | Acquiring/submitting payment instruments, the 3 handler scenarios, signing requests |
| [references/transports-mcp-a2a.md](references/transports-mcp-a2a.md) | REST vs MCP vs A2A vs Embedded request/response shapes |

## Roles

| Role | Notes |
|------|-------|
| Platform (you) | App/AI agent consuming capabilities on behalf of a user or process |
| Business | Merchant of Record; publishes the profile you discover |
| Credential Provider (CP) | Wallet/identity provider (Google Pay, Shop Pay) you talk to directly for tokens |
| PSP | Payment processor the business charges through; you never talk to it directly |

## Discovery & Negotiation Flow

1. Fetch the business profile: `GET https://business.example.com/.well-known/ucp`.
2. Match your protocol version to its `version` (or a key in `supported_versions`); stop if neither matches.
3. Validate each capability's `schema` URL origin against its reverse-domain namespace before trusting it.
4. Advertise your own profile URL on **every** request via `UCP-Agent` (REST) or `meta.ucp-agent.profile` (MCP).
5. Read `ucp.capabilities` in every response — it tells you exactly what's active for that operation.

## UCP-Agent Header

```http
# REST (RFC 8941 Dictionary syntax)
UCP-Agent: profile="https://agent.example/profile"
```
```json
// MCP — inside params.arguments
{ "meta": { "ucp-agent": { "profile": "https://agent.example/profile" } } }
```

## Checkout Operations

| Operation | Method & Path | Call it when |
|-----------|---------------|----------------|
| Create Checkout | `POST /checkout-sessions` | User expresses purchase intent |
| Get Checkout | `GET /checkout-sessions/{id}` | Resuming/polling session state |
| Update Checkout | `PUT /checkout-sessions/{id}` | Fixing a `recoverable` error or adding info (full replacement) |
| Complete Checkout | `POST /checkout-sessions/{id}/complete` | Buyer commits to pay; returns the placed `order` |
| Cancel Checkout | `POST /checkout-sessions/{id}/cancel` | Abandoning a non-terminal session |

## Workflow: Building a UCP Client

1. Discover and negotiate: fetch the profile, validate namespaces, pick a transport.
2. Create Checkout when the user expresses purchase intent.
3. Run the error-processing algorithm on `messages`; call Update to fix `recoverable` issues.
4. Acquire a payment instrument via the negotiated handler, then call Complete.
5. Hand off to `continue_url` whenever status is `requires_escalation` (or any other handoff case).

## Reference Files

| File | Load When |
|------|-----------|
| [references/discovery-and-negotiation.md](references/discovery-and-negotiation.md) | Fetching/caching profiles, validating schema namespaces, handling discovery errors |
| [references/checkout-flow.md](references/checkout-flow.md) | Implementing the checkout state machine, error handling, or totals rendering |
| [references/payments-execution.md](references/payments-execution.md) | Acquiring payment tokens/mandates or signing requests |
| [references/transports-mcp-a2a.md](references/transports-mcp-a2a.md) | Choosing or implementing REST, MCP, A2A, or Embedded transport bindings |
