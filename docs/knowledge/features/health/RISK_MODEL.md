# Feature Risk Model & Deduplication

## 1. Risk Representation

A **Risk** is a synthesized exposure derived from one or more signals:

```typescript
export interface FeatureRisk {
  riskId: string;
  featureId: string;
  riskType: FeatureRiskType;
  severity: FeatureRiskSeverity;
  score: number; // 0 to 100
  confidence: number; // 0 to 1
  description: string;
  evidence: FeatureRiskEvidence[];
  contributingSignals: string[];
  affectedResources: string[];
  detectedAt: number;
  knowledgeVersion: string;
  active: boolean;
}
```

---

## 2. 12 Canonical Risk Types

1. `COMPLEXITY`: Maintainability hazards from nested or giant files.
2. `COUPLING`: Inflexible tight coupling across features.
3. `DEPENDENCY`: Fragile or unpinned third-party dependencies.
4. `VERIFICATION`: Defect escape hazards due to insufficient testing.
5. `BEHAVIOR`: Execution ambiguity and unhandled error cases.
6. `ARCHITECTURE`: Tier boundary violations and domain leaks.
7. `STABILITY`: High churn and recurring defect hotspots.
8. `INTEGRATION`: Remote failure cascading due to missing timeouts or circuit breakers.
9. `SECURITY`: Vulnerabilities, hardcoded tokens, or prompt injection exploits.
10. `CONFIDENCE`: Low certainty intelligence models.
11. `CIRCULAR_DEPENDENCY`: Architectural deadlock loops.
12. `RESOURCE_CONCENTRATION`: Single point of failure God components.

---

## 3. Deduplication Algorithm

When multiple detectors or signals identify issues of the same `FeatureRiskType` on a given feature, `RiskDetectorHelper.deduplicateRisks`:
- Merges them into a single aggregate `FeatureRisk`.
- Selects the **highest severity** present in the group.
- Selects the **maximum score** among the contributing risks.
- Concatenates contributing signal IDs and evidence items without duplication.
- Combines descriptions with delimiter ` | ` for full diagnostic context.
