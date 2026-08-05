# Payment Execution

## The 3-Step Lifecycle

1. **Negotiation** — read `payment_handlers` from the business's checkout response (already filtered to this cart's context).
2. **Acquisition** — execute the handler's own protocol directly against its Credential Provider (never through the business) to obtain an opaque token, encrypted payload, or mandate.
3. **Completion** — submit the resulting instrument via Complete Checkout; the business charges it through its own PSP integration.

## Scenario A — Digital Wallet (Google Pay / Shop Pay)

Read the handler's `config` (`merchant_info`, `allowed_payment_methods`, `tokenization_specification`, or `shop_id`) from the checkout response, call the wallet's own SDK/API with it to get an encrypted token, then wrap it as a `payment.instruments[]` entry:

```json
{ "payment": { "instruments": [{
  "id": "pm_1234567890abc", "handler_id": "8c9202bd-...", "type": "card", "selected": true,
  "display": { "brand": "visa", "last_digits": "4242" },
  "credential": { "type": "PAYMENT_GATEWAY", "token": "{\"signature\":\"...\"}" }
}] } }
```

## Scenario B — Direct Tokenization + SCA Challenge

Call the tokenizer's `token_url` with its `public_key` to mint a token, then submit it at Complete. If the PSP soft-declines, the business responds `status: "requires_escalation"` with `code: "requires_3ds"` and a `continue_url` challenge page — open it (WebView/window), then retry Complete once the buyer finishes the bank challenge.

## Scenario C — Autonomous Agent (AP2 Mandates)

For a `dev.ucp.shopping.ap2_mandate`-compatible handler, instead of a bare token you cryptographically sign:

- A **CheckoutMandate** — the hash of the offered `CheckoutObject` (proves you saw and agreed to these exact terms).
- A **PaymentMandate** — an SD-JWT-VC payment authorization signed with the user's credential.

Submit both at Complete Checkout (`payment.instruments[].credential` + the request's `ap2` block). This is non-repudiable proof this specific transaction was authorized — required for fully autonomous completion without a human-in-the-loop review step. See [ucp.dev AP2 Mandates](https://ucp.dev/latest/specification/ap2-mandates/) and [UCP and AP2](https://ucp.dev/documentation/ucp-and-ap2/) for the full flow.

## `available_instruments` Resolution

You declare your supported instrument types/constraints in your own profile; the business intersects that with its own support and the cart context, then returns the authoritative `available_instruments` in its response. Always treat that response value as final — never override it with your own profile's declaration.

## PCI Scope Minimization

- Handle only opaque tokens/encrypted payloads/mandates — never raw PANs or CVVs.
- Clear credentials from memory immediately after submission; re-acquire on expiration rather than caching raw credentials.
- Always use HTTPS; validate handler configs before executing their protocol.

## Request Signing (RFC 9421)

When using HTTP Message Signatures, sign with a key referenced by your own profile's `keys`:

```http
POST /checkout-sessions HTTP/1.1
UCP-Agent: profile="https://platform.example/.well-known/ucp"
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Digest: sha-256=:X48E9q...:
Signature-Input: sig1=("@method" "@authority" "@path" "idempotency-key" "content-digest" "content-type");keyid="platform-2026"
Signature: sig1=:MEUCIQ...:
```

## Signals & Attribution

- `signals` (e.g. `dev.ucp.buyer_ip`, `dev.ucp.user_agent`) MUST be values you directly observed or independently verified — never buyer-asserted claims. All signal keys are reverse-domain namespaced (well-known ones under `dev.ucp.*`).
- `attribution` carries your own campaign/click-ID context (e.g. `gclid`, `campaign_source`) — optional and informational only; its presence or absence MUST NOT affect negotiation or the response.
