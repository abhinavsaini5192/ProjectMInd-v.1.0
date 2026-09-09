# Feature Criticality & Stability Models

## 1. Feature Criticality

Criticality defines the **systemic centrality and importance** of a feature to the repository, not its bugginess or risk.

```typescript
export interface FeatureCriticality {
  score: number; // 0 to 100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metrics: {
    dependentCount: number;
    exportCount: number;
    endpointCount: number;
    entryPointCount: number;
    coreDomain: boolean;
  };
  confidence: number;
  evidence: FeatureRiskEvidence[];
}
```

### Criticality Formula

$$\text{Criticality Score} = 10 \times \text{dependents} + 2 \times \text{exports} + 12 \times \text{endpoints} + 15 \times \text{entryPoints} + (40 \text{ if core domain else } 0)$$

- **CRITICAL**: $\ge 75$
- **HIGH**: $50–74$
- **MEDIUM**: $25–49$
- **LOW**: $< 25$

---

## 2. Feature Stability

Stability models change volatility, commit churn, and defect frequency:

```typescript
export interface FeatureStability {
  score: number; // 0 to 100
  level: 'STABLE' | 'MOSTLY_STABLE' | 'UNSTABLE' | 'HIGHLY_UNSTABLE' | 'UNKNOWN';
  metrics: {
    commitCount: number;
    churnScore: number;
    authorCount: number;
    ageInDays: number;
    recentChangesCount: number;
  };
  confidence: number;
  evidence: FeatureRiskEvidence[];
}
```

### Stability Formula

$$\text{Stability Score} = 100 - \min(60, 2.5 \times \text{churn}) - \min(30, 2 \times \text{changes}) - (25 \text{ if breaking change else } 0)$$

- **STABLE**: $\ge 80$
- **MOSTLY_STABLE**: $60–79$
- **UNSTABLE**: $35–59$
- **HIGHLY_UNSTABLE**: $< 35$
