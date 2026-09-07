# Model: FeatureBehavior

## Overview

The `FeatureBehavior` model is the canonical entity representing the complete behavioral state of a feature in ProjectMind.

```typescript
export interface FeatureBehavior {
  behaviorId: string;
  featureId: FeatureId;
  flows: FeatureFlow[];
  entryPoints: FeatureFlowNode[];
  primaryFlows: FeatureFlow[];
  alternativeFlows: FeatureFlow[];
  failureFlows: FeatureFlow[];
  confidence: FeatureBehaviorConfidence;
  evidence: FeatureBehaviorEvidence[];
  active: boolean;
  behaviorVersion: number;
  knowledgeVersion: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}
```

---

## Schema Attributes

| Field | Type | Description |
| :--- | :--- | :--- |
| `behaviorId` | `string` | Unique identifier (e.g. `behavior_172573...`). |
| `featureId` | `FeatureId` | Reference to parent `Feature` entity. |
| `flows` | `FeatureFlow[]` | Array of all active execution flows belonging to this feature. |
| `entryPoints` | `FeatureFlowNode[]` | Deduplicated list of entry points initiating execution into this feature. |
| `primaryFlows` | `FeatureFlow[]` | Golden-path execution paths (e.g. successful login, order checkout). |
| `alternativeFlows` | `FeatureFlow[]` | Valid secondary execution paths (e.g. OAuth login, token refresh). |
| `failureFlows` | `FeatureFlow[]` | Error recovery paths and exception branches (e.g. 401 Unauthorized, 400 Bad Request). |
| `confidence` | `FeatureBehaviorConfidence` | Calibrated confidence score (`0.0` to `1.0`), level, and reasoning breakdown. |
| `evidence` | `FeatureBehaviorEvidence[]` | Full provenance tracking all supporting extraction signals. |
| `active` | `boolean` | `true` if current behavior reflects active codebase state. |
| `behaviorVersion` | `number` | Incremented sequentially on code refactoring or re-analysis. |
| `knowledgeVersion` | `string` | Engine release version (e.g. `6.5.0`). |

---

## Lifecycle States

1. **Candidate Detection**: Individual sources propose fragments as `FeatureBehaviorCandidate`.
2. **Synthesis & Promotion**: `FeatureFlowBuilder` assembles cohesive flows and promotes candidates.
3. **Active Behavior**: Validated and stored in `FeatureBehaviorRepository`.
4. **Incremental Revision**: Source modification increments `behaviorVersion` and refreshes flows without breaking historical tracking.
5. **Deactivation**: Deleting or replacing feature deactivates old flows cleanly.
