# Payments & Signing

## Payment Architecture Roles

A **Payment Handler** is a specification (e.g. `com.google.pay`, `dev.shopify.shop_pay`), not a participant. The **Credential Provider (CP)**/**PSP** is the participant that authors and executes it. You (the business):

1. Choose which handlers to accept and publish your own `config` for each (merchant IDs, public keys) in your profile and checkout responses.
2. Never touch raw credentials — the platform executes the handler's protocol directly against the CP and hands you back an opaque result.
3. Charge the resulting token/mandate through your own PSP integration.

## Advertising Handlers

Declare a `payment_handlers` registry in your profile *and* in each checkout response (dynamically filtered per cart context — e.g. drop BNPL for subscription items, drop regional methods based on shipping destination). Each entry needs `id` (your instance id), `version`, `spec`, `schema`, `config`, and optionally `available_instruments`.

## Resolving `available_instruments`

The platform declares what instrument types/constraints it supports (from its own profile). You intersect that with your own constraints and the current cart context, then return the resolved, authoritative `available_instruments` in your response — platforms MUST treat your response value as final.

## PCI Scope Minimization

- Accept only opaque credentials: tokens, encrypted payloads, or mandates — never raw PANs/CVVs.
- Route by `handler_id` to select the correct decryption/charging key (prevents key-confusion attacks).
- MUST NOT echo credentials back in any response.
- Use separate PSP credentials for TEST vs PRODUCTION; implement idempotency on payment capture; never log raw credentials; set reasonable credential/token timeouts.

## Message Signing (RFC 9421)

Sign responses and webhooks using a key from your profile's `signing_keys`:

```http
HTTP/1.1 200 OK
Content-Digest: sha-256=:Y5fK8n...:
Signature-Input: sig1=("@status" "content-digest" "content-type");keyid="business_2026"
Signature: sig1=:MFQCIH7k...:
```

- `Content-Digest` (SHA-256, RFC 9530) is required whenever a body is present.
- `Signature-Input` lists signed components plus `keyid`, matching a `kid` in your `signing_keys`.
- Signing business→platform **webhooks is REQUIRED**. Response signing is **RECOMMENDED** for `complete_checkout` (order confirmation) and **OPTIONAL** for `create`/`get`/`update`/`cancel_checkout`.

## AP2 Mandates (Autonomous Agents)

Optional extension `dev.ucp.shopping.ap2_mandate` provides cryptographic, non-repudiable proof for autonomous-agent scenarios:

1. You respond with a `checkoutSignature` (detached JWT over the checkout state) plus supported verifiable-presentation formats (e.g. `sd-jwt`).
2. The platform's agent, on user consent, returns a `CheckoutMandate` (hash of the checkout state) and a `PaymentMandate` (SD-JWT-VC) at Complete Checkout.
3. You verify the `CheckoutMandate`; your PSP verifies the `PaymentMandate`. Both must check out before you process the charge.

See [ucp.dev AP2 Mandates](https://ucp.dev/latest/specification/ap2-mandates/) and [UCP and AP2](https://ucp.dev/documentation/ucp-and-ap2/) for the full mandate schema and signing details.

## Example: Google Pay Handler Config

```json
{
  "com.google.pay": [{
    "id": "8c9202bd-63cc-4241-8d24-d57ce69ea31c",
    "version": "2026-04-08",
    "config": {
      "api_version": 2, "api_version_minor": 0, "environment": "TEST",
      "merchant_info": { "merchant_name": "Example Merchant", "merchant_id": "...", "merchant_origin": "checkout.merchant.com" },
      "allowed_payment_methods": [{
        "type": "CARD",
        "parameters": { "allowed_auth_methods": ["PAN_ONLY"], "allowed_card_networks": ["VISA", "MASTERCARD"] },
        "tokenization_specification": { "type": "PAYMENT_GATEWAY", "parameters": { "gateway": "example", "gatewayMerchantId": "..." } }
      }]
    }
  }]
}
```

## Security Checklist

- Validate `handler_id` is one you actually advertised before processing an instrument.
- Reject requests failing signature verification (`signature_invalid`/`key_not_found`) rather than falling back silently.
- Log payment events without ever logging credentials.
- For high-value or fully autonomous scenarios, support the `dev.ucp.shopping.ap2_mandate` extension for non-repudiable proof.
