# Canonical Feature Model

A **Feature** in ProjectMind is a semantic abstraction representing a meaningful user-facing or system-level capability.

## Structure
```typescript
export interface Feature {
  id: FeatureId;
  name: string;
  description: string;
  type: FeatureType;
  status: FeatureStatus;
  origin: FeatureOrigin;
  confidence: FeatureConfidence;
  scope: FeatureScope;
  metadata: FeatureMetadata;
  references: FeatureReference[];
  relationships: FeatureRelationship[];
  evidence?: FeatureEvidence[];
  version: number;
  createdAt: number;
  updatedAt: number;
}
```

## Fundamental Principles
1. **Feature ≠ File / Module**: A Feature represents an end-to-end capability that spans multiple files, symbols, tests, routes, and configs.
2. **References over Copies**: The Feature layer references existing knowledge entities (`FILE`, `SYMBOL`, `MODULE`, `TEST`, etc.) via stable non-destructive IDs rather than duplicating repository state.
