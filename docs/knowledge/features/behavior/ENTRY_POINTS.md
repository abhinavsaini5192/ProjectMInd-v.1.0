# Entry Points Discovery

## Overview

An **Entry Point** represents an ingress boundary where an actor or external system invokes a feature.

The `EntryPointSource` discovers entry points across 5 distinct interaction paradigms:

| Entry Point Type | Description | Discovered Resources |
| :--- | :--- | :--- |
| `API` | HTTP REST or GraphQL route | Mapped `ENDPOINT` resources, Express/Fastify routes. |
| `CLI` | Terminal command or sub-command | Mapped `COMMAND` resources, Commander/Yargs definitions. |
| `UI` | User interface event or interaction | Mapped `UI_COMPONENT` resources, button clicks, form submits. |
| `SCHEDULED` | Cron or timer recurring job | Cron jobs, interval timers, periodic tasks. |
| `EVENT` | Message queue or pub/sub trigger | Event subscribers, message queue consumers. |

---

## Synthesis & Node Representation

When discovered, entry points become nodes with `stepType: 'ENTRY_POINT'`:

```typescript
{
  nodeId: "node_172573...",
  resourceId: "POST /api/auth/login",
  resourceType: "ENDPOINT",
  stepType: "ENTRY_POINT",
  label: "POST /api/auth/login",
  metadata: {
    entryPointType: "API",
    method: "POST",
    route: "/api/auth/login",
    operation: "POST /api/auth/login"
  },
  confidence: 0.95
}
```

The `FeatureFlowBuilder` uses each distinct entry point as an anchor seed for generating an end-to-end execution flow.
