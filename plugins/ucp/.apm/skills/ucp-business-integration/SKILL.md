---
name: ucp-business-integration
description: "Implement the Universal Commerce Protocol (UCP) as a business/merchant: publish a /.well-known/ucp discovery profile, declare capabilities (Checkout, Cart, Order, Identity Linking) and payment handlers, implement REST checkout-session endpoints (create/get/update/complete/cancel), resolve payment instruments, sign responses and order webhooks (RFC 9421), and integrate with Google Merchant Center (product feed eligibility, Google Pay handler, order webhooks). USE FOR: building a UCP-compliant business/merchant server; publishing and hosting a UCP profile; declaring capabilities, extensions, and payment_handlers; implementing the checkout status lifecycle and error messages; signing webhook/response messages; Google UCP merchant integration. DO NOT USE FOR: building a platform/agent that consumes UCP (see ucp-platform-integration); generic e-commerce platform work unrelated to UCP; the AP2/A2A/MCP protocols outside their UCP bindings."
---

# UCP Business Integration

UCP lets a business (merchant/retailer) publish one machine-readable profile that platforms and AI agents discover to run checkout, cart, and order flows — no bespoke integration per platform.

## Anatomy

| File | Purpose |
|------|---------|
| SKILL.md | Roles, profile skeleton, capability/endpoint quick-reference |
| [references/profile-and-discovery.md](references/profile-and-discovery.md) | Hosting `/.well-known/ucp`, namespace governance, negotiation, versioning |
| [references/capabilities-and-checkout.md](references/capabilities-and-checkout.md) | Checkout/Cart/Order/Identity Linking, status lifecycle, error handling, totals |
| [references/payments-and-signing.md](references/payments-and-signing.md) | Advertising payment handlers, instrument resolution, PCI scope, RFC 9421, AP2 |
| [references/google-merchant-integration.md](references/google-merchant-integration.md) | Merchant Center setup, feed flags, Google Pay handler, order webhook to Google |

## Roles

| Role | You are... | Responsibility |
|------|-------------|-----------------|
| Business (you) | Merchant of Record | Publish profile, declare capabilities, process sessions |
| Platform | App/AI agent consuming your capabilities | Discovers you, drives the session |
| Credential Provider (CP) | Wallet/identity provider (Google Pay, Shop Pay) | Issues payment tokens, holds PII |
| PSP | Payment processor (Stripe, Adyen, ...) | Authorizes/captures/settles funds |

## Minimal Business Profile

Published at `GET /.well-known/ucp` (HTTPS, no redirects, `Cache-Control: public, max-age>=60`):

```json
{
  "ucp": {
    "version": "2026-04-08",
    "services": { "dev.ucp.shopping": [{ "version": "2026-04-08", "transport": "rest",
      "endpoint": "https://business.example.com/ucp/v1",
      "schema": "https://ucp.dev/2026-04-08/services/shopping/rest.openapi.json" }] },
    "capabilities": { "dev.ucp.shopping.checkout": [{ "version": "2026-04-08",
      "spec": "https://ucp.dev/2026-04-08/specification/checkout",
      "schema": "https://ucp.dev/2026-04-08/schemas/shopping/checkout.json" }] },
    "payment_handlers": { }
  },
  "signing_keys": [{ "kid": "business_2026", "kty": "EC", "crv": "P-256", "x": "...", "y": "...", "use": "sig", "alg": "ES256" }]
}
```

## Standard Capabilities

| Capability | Purpose |
|------------|---------|
| `dev.ucp.shopping.cart` | Pre-checkout basket transfer (`CreateCart` only today) |
| `dev.ucp.shopping.checkout` | Checkout sessions: cart, tax, payment, order placement |
| `dev.ucp.shopping.order` | Post-purchase webhook updates (shipped, delivered, adjustments) |
| `dev.ucp.common.identity_linking` | OAuth 2.0 account linking for authenticated checkout |
| Extensions: `discount`, `fulfillment`, `payment_authentication`, `ap2_mandate`, `buyer_consent` | Optional, `extends` a root capability via `allOf` |

## Checkout REST Endpoints

| Operation | Method & Path |
|-----------|---------------|
| Create Checkout | `POST /checkout-sessions` |
| Get Checkout | `GET /checkout-sessions/{id}` |
| Update Checkout | `PUT /checkout-sessions/{id}` (full replacement) |
| Complete Checkout | `POST /checkout-sessions/{id}/complete` |
| Cancel Checkout | `POST /checkout-sessions/{id}/cancel` |

## Workflow: New Business Integration

1. Prepare product data — mark checkout eligibility, disclosures, return/support policy.
2. Publish your UCP profile declaring `services`, `capabilities`, `payment_handlers`, `signing_keys`.
3. Implement the 5 Checkout REST operations and the status lifecycle (`incomplete` → ... → `completed`).
4. Advertise and resolve payment handlers; sign responses and webhooks (RFC 9421).
5. Default to guest checkout, or implement Identity Linking (OAuth 2.0) for account-linked flows.
6. Push Order lifecycle webhooks (created, shipped, delivered, adjustments) to each linked platform.

## Reference Files

| File | Load When |
|------|-----------|
| [references/profile-and-discovery.md](references/profile-and-discovery.md) | Hosting/serving the profile, validating namespaces, negotiating capabilities/versions with a platform |
| [references/capabilities-and-checkout.md](references/capabilities-and-checkout.md) | Implementing checkout operations, status transitions, error messages, totals, or identity linking |
| [references/payments-and-signing.md](references/payments-and-signing.md) | Advertising payment handlers, resolving instruments, signing messages, or supporting AP2 mandates |
| [references/google-merchant-integration.md](references/google-merchant-integration.md) | Integrating with Google Merchant Center, AI Mode, or Gemini checkout |
