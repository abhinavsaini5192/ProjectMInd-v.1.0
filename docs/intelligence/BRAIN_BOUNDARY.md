# Strict Brain Boundary Policy

## Core Principle

The Brain and SLM inference modules must **never** directly perform I/O, execute shell commands, read raw filesystem files outside of authorized scope, access production databases, or bypass orchestration policies.

The Brain operates strictly as an inference and proposal engine.

## Information Request Protocol

When the reasoning engine or Brain needs information from the repository or environment, it issues a strictly-typed `InformationRequest`:

```typescript
export interface InformationRequest {
  requestId: string;
  type: 'FILE' | 'SYMBOL' | 'MODULE' | 'DEPENDENCY' | 'CONFIGURATION' | 'TEST' | 'DIFF' | 'METRICS';
  target: string;
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}
```

The request is validated and resolved via `BrainBoundaryGateway`. Sensitive targets (such as `.env`, `/etc/passwd`, SSH keys, credentials) are strictly blocked and trigger `AgentSecurityError`.

## Action Proposal Protocol

When the Brain proposes actions to alter the repository state, it issues an `ActionProposal`:

```typescript
export interface ActionProposal {
  proposalId: string;
  actionType: 'CREATE' | 'MODIFY' | 'DELETE' | 'EXECUTE';
  resourceUri: string;
  intent: string;
  estimatedImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  payload?: any;
  rollbackPlan?: string;
}
```

Every proposal is evaluated by `BrainBoundaryGateway`:
- Disallowed action types under current policy are rejected.
- High-impact or critical actions (e.g., recursive deletion) require explicit approval and cannot be auto-executed.
