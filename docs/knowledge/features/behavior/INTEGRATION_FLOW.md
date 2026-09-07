# External Integrations & SDK Boundaries

## Overview

Features frequently interface with third-party software development kits (SDKs) and remote APIs (e.g. Stripe, AWS S3, SendGrid, Twilio, OAuth2 providers).

---

## Identification & Representation

The `IntegrationFlowSource` identifies external dependencies without executing network traffic or invoking external services.

```typescript
{
  nodeId: "node_172573...",
  resourceId: "stripe",
  resourceType: "DEPENDENCY",
  stepType: "EXTERNAL_SERVICE",
  label: "External: stripe",
  metadata: {
    externalService: true,
    provider: "stripe"
  },
  confidence: 0.85
}
```

---

## Guarantees

1. **Zero External Calls**: ProjectMind never sends HTTP requests to external third-party endpoints.
2. **Deterministic Metadata**: Provider identity, SDK package, and target operations are documented statically from Layer 1 dependency and import extraction.
