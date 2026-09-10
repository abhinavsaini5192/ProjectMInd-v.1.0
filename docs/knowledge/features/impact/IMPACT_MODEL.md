# Feature Change Impact Data Model

## 1. Model Hierarchy

The impact engine centers around a clean, strongly typed data model capturing changed entities, causal graph elements, and resulting impacts.

```
ChangeTarget
    │
    ▼
ImpactCandidate
    │
    ▼
┌───────────────────┬───────────────────┐
│                   │                   │
▼                   ▼                   ▼
FeatureImpact     ResourceImpact    ImpactPath
```

---

## 2. Core Entities

### `ChangeTarget`
Defines the repository element undergoing change.
```typescript
interface ChangeTarget {
  targetId: string;
  targetType?: ChangeTargetType; // 'FILE' | 'SYMBOL' | 'ENDPOINT' | 'SCHEMA' | 'CONFIGURATION' | 'FEATURE'
  filePath?: string;
  symbolName?: string;
  changeType: ChangeType; // 'ADDED' | 'MODIFIED' | 'DELETED' | 'RENAMED' | 'MOVED' | 'SIGNATURE_CHANGED' | 'BEHAVIOR_CHANGED'
  metadata?: Record<string, unknown>;
  oldFilePath?: string;
  oldSymbolName?: string;
}
```

### `FeatureImpact`
Represents the prospective effect of a change on a feature.
```typescript
interface FeatureImpact {
  impactId: string;
  targetFeatureId: string;
  impactType: ImpactType; // 'DIRECT' | 'INDIRECT' | 'API' | 'DATA' | 'INTEGRATION' | 'BEHAVIORAL' | 'VERIFICATION' | 'CONFIG'
  impactScope: ImpactScope; // 'FEATURE' | 'WORKSPACE' | 'REPOSITORY' | 'CROSS_FEATURE'
  direction: ImpactDirection; // 'DOWNSTREAM' | 'UPSTREAM' | 'BIDIRECTIONAL'
  severity: ImpactSeverity; // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE'
  score: number; // 0 to 100
  confidence: ImpactConfidence; // 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW'
  direct: boolean;
  distance: number; // Hop count from changed resource (0 = direct)
  evidence: ImpactEvidence[];
  impactPathIds: string[];
  contributingChanges: string[];
  criticality?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  knowledgeVersion: string;
  impactVersion: number;
}
```

### `ResourceImpact`
Represents the effect of a change on dependent technical resources.
```typescript
interface ResourceImpact {
  resourceImpactId: string;
  targetResourceId: string;
  resourceType: string;
  impactType: ImpactType;
  severity: ImpactSeverity;
  score: number;
  confidence: ImpactConfidence;
  distance: number;
  evidence: ImpactEvidence[];
  associatedFeatureIds: string[];
  impactPathIds: string[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### `ImpactPath`
Traces the step-by-step causal path from the root change to the affected feature or resource.
```typescript
interface ImpactPath {
  pathId: string;
  sourceTargetId: string;
  targetFeatureId?: string;
  targetResourceId?: string;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  length: number;
  aggregateScore: number;
  aggregateConfidence: number;
  cycleDetected: boolean;
  pathDescription: string;
}
```

### `ImpactEvidence`
Captures verifiable evidence justifying the impact assessment.
```typescript
interface ImpactEvidence {
  evidenceId: string;
  source: ImpactSourceType;
  sourceId: string;
  evidenceType: string;
  description: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}
```

### `ImpactConflict`
Records contradictions between different analytical perspectives (e.g. static dependency present, but runtime flow bypasses).
```typescript
interface ImpactConflict {
  conflictId: string;
  targetId: string;
  conflictType: 'STRUCTURAL_VS_BEHAVIORAL' | 'TEST_VS_IMPLEMENTATION' | 'DIRECT_VS_INDIRECT';
  description: string;
  conflictingSources: string[];
  resolvedImpactType: ImpactType;
  resolutionRationale: string;
}
```

### `ImpactResult`
The comprehensive aggregate result of an impact analysis.
```typescript
interface ImpactResult {
  analysisId: string;
  timestamp: number;
  changes: ChangeTarget[];
  featureImpacts: FeatureImpact[];
  resourceImpacts: ResourceImpact[];
  paths: ImpactPath[];
  conflicts: ImpactConflict[];
  statistics: {
    totalFeaturesEvaluated: number;
    totalResourcesEvaluated: number;
    totalImpactsDetected: number;
    maxDepthReached: number;
    cycleCount: number;
    analysisDurationMs: number;
    skippedNodes: number;
  };
}
```
