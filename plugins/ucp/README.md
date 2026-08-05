# ucp

Skills for implementing (business/merchant) and consuming (platform/agent) the Universal Commerce Protocol (UCP), the open standard for agentic commerce discovery, checkout, and payments.

## Skills

| Skill | Description |
|-------|-------------|
| [ucp-business-integration](.apm/skills/ucp-business-integration) | Implement UCP as a business/merchant server: publish a `/.well-known/ucp` profile, expose Checkout/Cart/Order/Identity Linking capabilities, advertise payment handlers, sign responses, and integrate with Google Merchant Center |
| [ucp-platform-integration](.apm/skills/ucp-platform-integration) | Consume UCP as a platform, app, or AI agent: discover business capabilities, negotiate versions, drive the checkout session lifecycle, execute payment handlers, and call UCP over REST, MCP, A2A, or Embedded transports |

## Install

```bash
apm install ucp@intelligentium
```

Part of the [Intelligentium](../../README.md) marketplace.
