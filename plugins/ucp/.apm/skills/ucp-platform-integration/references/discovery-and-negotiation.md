# Discovery & Negotiation

## Fetching the Business Profile

- `GET https://business.example.com/.well-known/ucp` — reject non-HTTPS URLs; MUST NOT follow 3xx redirects; enforce connect/response timeouts.
- Cache per its `Cache-Control`, but enforce your own minimum TTL floor of 60s regardless of the origin's headers. MAY use stale-while-revalidate for background refresh.
- On a signature failure against an unknown `kid`, you MAY force-refresh the cached profile — but no more than once per TTL floor per origin.

## Advertising Your Own Profile

Every request MUST carry your profile URL, using the transport-appropriate mechanism (see [transports-mcp-a2a.md](transports-mcp-a2a.md)). This is also where the business looks up your signing keys (`keys`/`signing_keys` JWK array) to verify your request signatures, so keep it accurate and stably hosted.

## Version Negotiation

- Match your protocol version against the profile's `version`. If it doesn't match, check `supported_versions[your_version]` for a version-specific profile URI (a leaf document — it won't itself contain `supported_versions`).
- If neither matches, do not send requests at that version — expect `version_unsupported` if you do.
- Trust the negotiated `ucp.version` echoed in *every* response, not just what you saw at discovery time.

## Capability Intersection

The business computes this server-side, but you can predict what you'll get back by applying the same algorithm to the profile you fetched:

1. Intersect by `name` — only capabilities both parties declare are candidates.
2. For each match, compute the set of mutually-supported versions; select the highest (latest date); exclude if empty.
3. Prune orphaned extensions — remove any capability whose `extends` parent(s) aren't in the intersection.
4. Repeat step 3 until stable (handles chained/transitive extensions).

| Your operation | Relevant capabilities in the response |
|-----------------|----------------------------------------|
| `create_checkout` / `update_checkout` / `complete_checkout` | `checkout` + its active extensions (e.g. `discount`, `fulfillment`) |
| `create_cart` / `update_cart` | `cart` + its active extensions |
| Order webhooks | `order` only |

## Namespace Validation

Every capability/service name follows `{reverse-domain}.{service}.{capability}`. Before trusting a `schema` URL, validate its origin matches the name's reverse-domain authority:

| Namespace | Valid schema origin |
|-----------|----------------------|
| `dev.ucp.*` | `https://ucp.dev/...` |
| `com.{vendor}.*` | `https://{vendor}.com/...` |

Reject/ignore any capability whose `schema` origin fails this check — it's your defense against a business spoofing a namespace it doesn't own. Note: the `spec` (human-readable docs) URL is **not** authority-bound, only `schema` is.

## Schema Resolution

1. Fetch the base capability schema plus every active extension's schema.
2. If an extension declares `requires.protocol` / `requires.capabilities` version constraints, verify the negotiated versions satisfy them; drop non-satisfying extensions and re-run pruning.
3. Compose via each extension's `allOf` against `$defs[<root_capability>]`.
4. Validate requests/responses against the composed schema.

## Discovery & Negotiation Errors

| Code | Meaning | HTTP | JSON-RPC |
|------|---------|------|----------|
| `invalid_profile_url` | Business's profile URL malformed/missing | 400 | -32001 |
| `profile_unreachable` | Fetch failed (timeout, non-2xx) | 424 | -32001 |
| `profile_malformed` | Fetched content invalid | 422 | -32001 |
| `version_unsupported` | Your protocol version isn't supported | 422 | -32001 |
| `capabilities_incompatible` | Empty intersection | 200 | in `result` |

Discovery/version failures are transport errors — no resource exists. `capabilities_incompatible` is a normal `200` response carrying `ucp.status: "error"` and `messages`. Both cases may include `continue_url` — use it to hand the buyer off to the business's own web experience.
