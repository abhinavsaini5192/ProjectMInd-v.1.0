# Health Model & Aggregate Root

## FeatureHealth Aggregate Root

`FeatureHealth` is the central domain entity modeling the comprehensive health and risk posture of a feature:

```typescript
export interface FeatureHealth {
  healthId: string;
  featureId: string;
  healthScore: FeatureHealthScore;
  riskAssessment: RiskAssessment;
  criticality: FeatureCriticality;
  stability: FeatureStability;
  verificationQuality: VerificationQuality;
  recommendations: HealthRecommendation[];
  signals: HealthSignal[];
  conflicts: FeatureHealthConflict[];
  version: FeatureHealthVersion;
  metadata: Record<string, unknown>;
  isStale: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## 10 Health Dimensions

Each dimension is scored from `0` (compromised) to `100` (optimal):

| Dimension | Description | Weight |
| :--- | :--- | :---: |
| **STRUCTURAL_HEALTH** | Resource hygiene, single points of failure, unassigned TODOs | 10% |
| **DEPENDENCY_HEALTH** | Coupling balance, package versions, circular dependencies | 10% |
| **BEHAVIOR_HEALTH** | Flow branch complexity, dead ends, unhandled errors | 10% |
| **VERIFICATION_HEALTH** | Automated test coverage, integration tests, verified flows | 15% |
| **ARCHITECTURE_HEALTH** | Layer boundaries, cross-domain database sharing, encapsulation | 10% |
| **STABILITY_HEALTH** | Churn rate, modification frequency, breaking changes | 10% |
| **INTEGRATION_HEALTH** | API documentation, timeouts, circuit breakers | 10% |
| **SECURITY_HEALTH** | Credentials, authentication guards, prompt injection defense | 10% |
| **COMPLEXITY_HEALTH** | Cyclomatic complexity, nesting depth, large LOC files | 10% |
| **CONFIDENCE_HEALTH** | Intelligence model certainty, evidence staleness | 5% |

---

## Feature Health Statuses

Mapped deterministically from the aggregate health score:

- **HEALTHY** (`85–100`): Robust quality, comprehensive verification, no high-severity risks.
- **STABLE** (`70–84`): Well-maintained with minor non-blocking issues.
- **ATTENTION_REQUIRED** (`50–69`): Moderate weaknesses in verification, documentation, or complexity.
- **DEGRADED** (`35–49`): Significant architectural, stability, or behavioral deficiencies.
- **HIGH_RISK** (`20–34`): Multiple severe risks threatening system stability.
- **CRITICAL** (`0–19`): Catastrophic exposure (e.g., circular dependency deadlocks, exposed secrets, missing auth).
- **UNKNOWN**: Insufficient evidence or unmapped resource baseline.
