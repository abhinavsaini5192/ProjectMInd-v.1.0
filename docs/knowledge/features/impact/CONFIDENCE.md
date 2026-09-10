# Impact Confidence Evaluation

## 1. Principles of Confidence

In the Feature Change Impact Engine, **Confidence** measures how certain the engine is that a predicted impact will materialize in practice.

A change with **CRITICAL** severity might have **LOW** confidence if it is based solely on a distant, dynamic import; conversely, a **LOW** severity change might have **VERY_HIGH** confidence if backed by direct AST call references and verified test mappings.

---

## 2. Confidence Sources & Weights

Confidence is aggregated from corroborating evidence items produced by the 11 impact sources:

| Source Type | Base Weight | Validation Metric |
| :--- | :--- | :--- |
| `MAPPING` | 0.90 | Verified static AST symbol or file ownership. |
| `DEPENDENCY` | 0.85 | Explicit semantic or structural dependency edge. |
| `BEHAVIOR` | 0.80 | Execution trace or runtime flow sequence. |
| `ENDPOINT` | 0.85 | OpenAPI route contract or HTTP controller mapping. |
| `DATA` | 0.80 | Database schema entity foreign key or query reference. |
| `INTEGRATION` | 0.75 | External API adapter or client module reference. |
| `TEST` | 0.70 | Unit or integration test execution coverage. |
| `ARCHITECTURE` | 0.65 | Layer or package boundary definition. |
| `HEALTH_RISK` | 0.60 | Historical instability or defect density correlation. |

---

## 3. Confidence Calculation Formula

Given a set of evidence items $E = \{e_1, e_2, \dots, e_n\}$:

$$Confidence_{composite} = 1 - \prod_{i=1}^{n} (1 - c_i)$$

Where $c_i \in [0, 1]$ is the confidence score of evidence item $i$.

The composite confidence is then mapped to the canonical `ImpactConfidence` level:

```typescript
function scoreToConfidence(score: number): ImpactConfidence {
  if (score >= 0.85) return 'VERY_HIGH';
  if (score >= 0.70) return 'HIGH';
  if (score >= 0.50) return 'MEDIUM';
  if (score >= 0.30) return 'LOW';
  return 'VERY_LOW';
}
```

---

## 4. Confidence Attenuation Across Hops

Similar to score decay, confidence decreases as path distance increases:

$$Confidence_{hop} = Confidence_{source} \times (0.9)^{distance}$$

Direct mappings retain full confidence, while distant 4th-hop connections reflect greater uncertainty.
