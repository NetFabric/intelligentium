# Google Merchant Center Integration

Google runs the first UCP reference implementation, powering checkout in AI Mode (Google Search) and Gemini. Google approval is required before going live — join the waitlist via the merchant interest form referenced in [developers.google.com/merchant/ucp](https://developers.google.com/merchant/ucp).

## Prerequisites

- A Merchant Center account in good standing with approved products for free listings.
- Return policy configured (cost, window, and a link to the full policy) — globally, per-product via `return_policy_label`, or inline via the `returns` feed attribute. Advanced accounts must configure this per sub-account.
- Customer support info with at least one contact method (URL, email, or phone) — powers the "Contact Merchant" link on order confirmation.

## Product Feed Attributes

| Attribute | Purpose |
|-----------|---------|
| `native_commerce(checkout_eligibility)` | Boolean; opts a product into checkout. Defaults to `FALSE`/ineligible if absent. |
| `consumer_notice` | Repeatable group: `notice_type` (`legal_disclaimer`\|`safety_warning`\|`prop_65`) + `notice_message` (≤1000 chars; `<b>`, `<br>`, `<i>`, `<a href>` allowed; escape `:` in URLs as `http\://` in feed files). |
| `merchant_item_id` | Overrides feed `id` when your Checkout API expects a different product identifier; takes precedence when present. |

Supply these via a supplemental data source (safest), the Merchant API's `customAttributes` on `productInputs.insert`, or the deprecated Content API's `products.insert` (must resend the full product — `products.update` doesn't support `customAttributes`).

## Ineligible Product Categories

Leave `checkout_eligibility` `FALSE`/absent for: subscriptions and installment/financed purchases; personalized/custom goods; refurbished, used, or final-sale items; pre-order items; bundles requiring extra contracts (warranty, install); special/freight shipping; gifting with split invoices or hidden pricing; in-store-activation products; age-restricted items; prohibited content (weapons, adult, healthcare/pharma, counterfeits); services, rentals, virtual/in-game items; goods requiring separate software installation.

## Cart API (UCP `2026-04-08`+)

`dev.ucp.shopping.cart` currently supports one-way cart transfer only — no update/delete/sync. Implement `POST /carts` (`CreateCart`):

- Request: `{ "line_items": [{ "item": { "id": "..." }, "quantity": 2 }] }`.
- Response: the initialized cart (`id`, resolved `line_items` with `title`/`price`/`totals`, `currency`, `totals`, `expires_at`) plus a `continue_url` pointing back to your cart/checkout page pre-loaded with that cart.

## Order Webhook to Google

- Endpoint: `https://shoppingdataintegration.googleapis.com/v1/webhooks/partners/[PARTNER_ID]/events/order?key=[API_KEY]` (Google assigns `PARTNER_ID`/`API_KEY`). Pass the key via the query param or an `X-Goog-Api-Key` header.
- Always send the **full** order entity on every update.
- Auth/signing has two variants:
  - **2026-01-23**: symmetric HMAC, or an asymmetric detached JWT (RFC 7797) over the body in a `Request-Signature` header, keyed by `kid` from your `signing_keys`.
  - **2026-04-08+**: mandatory `Webhook-Id` and `Webhook-Timestamp` headers (replacing the payload's former `id`/`created_time`), plus full RFC 9421 signing (`Content-Digest`, `UCP-Agent`, `Signature-Input`, `Signature`).
- Mandatory events: order created (`status: processing`), `shipped` and `delivered` (both required; `tracking_number`/`tracking_url`/`carrier` required on each). Recommended: `dispute` adjustments, `canceled` fulfillment events.
- Tax-inclusive markets: fold tax into the `subtotal` total (`display_text: "Subtotal (including taxes)"`) and omit a separate `tax` entry — apply consistently across all webhook events.
- Multi-item orders group into "packages" by shared `tracking_url`; package status (Ordered/Shipped/Delivered/Returned/Refunded/Canceled) derives from the latest `fulfillment.events[].type` and any `completed` `adjustments[].type` (`return`→Returned, `refund`→Refunded, `cancellation`→Cancelled).
- Common rejection reasons: missing order/`checkout_id`/`id`; an update timestamp older than the latest received; an `adjustments[].type` outside `refund`, `return`, `credit`, `price_adjustment`, `dispute`, `cancellation`.

## Identity Linking With Google

Required scopes: `dev.ucp.shopping.order:read`, `dev.ucp.shopping.checkout:manage` — present as one bundled consent screen rather than granular toggles. Optionally support **Google Streamlined Linking**, which uses JWT assertions (`check`/`create`/`get` intents) at your token endpoint to link or create accounts entirely within Google's UI, without a redirect-based linking frontend.
