# Relationship Model & Schemas

## Canonical Data Structures

### 1. `FeatureRelationship`
The canonical persistent relationship entity connecting two features:

```typescript
export interface FeatureRelationship {
  relationshipId: string;
  sourceFeatureId: FeatureId;
  targetFeatureId: FeatureId;
  relationshipType: FeatureRelationshipType;
  direction: FeatureRelationshipDirection;
  confidence: FeatureRelationshipConfidence;
  score: number;
  evidence: FeatureRelationshipEvidence[];
  source: RelationshipSource; // 'MANUAL' | 'DISCOVERED' | 'INFERRED' | 'IMPORTED'
  scope: FeatureScope;
  createdAt: number;
  updatedAt: number;
  knowledgeVersion: string;
  relationshipVersion: number;
  active: boolean;
  deactivationReason?: string;
}
```

### 2. `FeatureRelationshipCandidate`
Ephemeral model produced by discovery sources prior to scoring and validation:

```typescript
export type CandidateStatus = 'DETECTED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED' | 'PROMOTED';

export interface FeatureRelationshipCandidate {
  candidateId: string;
  sourceFeatureId: string;
  targetFeatureId: string;
  proposedType: FeatureRelationshipType;
  direction: FeatureRelationshipDirection;
  evidence: FeatureRelationshipEvidence[];
  score: number;
  confidence: FeatureRelationshipConfidence;
  sources: string[];
  conflicts: string[];
  status: CandidateStatus;
  createdAt: number;
  updatedAt: number;
}
```

### 3. `FeatureRelationshipEvidence`
Provenance record tracing why a relationship was detected:

```typescript
export interface FeatureRelationshipEvidence {
  evidenceId: string;
  relationshipId?: string;
  sourceType: string;
  sourceId: string;
  evidenceType: string;
  description: string;
  strength: number;
  confidence: number;
  metadata: Record<string, any>;
  timestamp: number;
}
```

### 4. `FeatureDependencyConflict`
Records competing, conflicting, or circular relationship assertions:

```typescript
export type ConflictSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type ConflictStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface FeatureDependencyConflict {
  conflictId: string;
  sourceFeatureId: string;
  targetFeatureId: string;
  relationships: FeatureRelationship[];
  reason: string;
  severity: ConflictSeverity;
  evidence: FeatureRelationshipEvidence[];
  status: ConflictStatus;
  createdAt: number;
}
```

### 5. `FeatureDependencyCycle`
Represents detected circular dependency loops in the feature graph:

```typescript
export type CycleClassification = 'VALIDATED_CYCLE' | 'SUSPECTED_CYCLE' | 'ARCHITECTURAL_RISK';

export interface FeatureDependencyCycle {
  cycleId: string;
  features: string[]; // [featA, featB, featC, featA]
  relationships: FeatureRelationship[];
  confidence: number;
  evidence: FeatureRelationshipEvidence[];
  classification: CycleClassification;
  createdAt: number;
}
```
