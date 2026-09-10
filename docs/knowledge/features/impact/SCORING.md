# Impact Scoring Algorithm

## 1. Scoring Principles

The **Impact Scorer** (`ImpactScorer`) calculates a deterministic score from 0 to 100 for each candidate impact. The scoring formula incorporates five distinct dimensions:
1. **Change Type Base Score** (inherent destructiveness/volatility of the edit)
2. **Distance Decay Factor** (attenuation over dependency hops)
3. **Dependency Strength** (coupling magnitude between features)
4. **Target Criticality Weight** (architectural centrality from Phase 6.6)
5. **Evidence Confidence Multiplier** (quality and volume of supporting facts)

---

## 2. Base Change Weights

Different change operations carry different inherent risks:

| Change Type | Base Score | Rationale |
| :--- | :--- | :--- |
| `DELETED` | 85 | Removing code or symbols breaks calling sites unless refactored. |
| `SIGNATURE_CHANGED` | 75 | Modifying parameter types or arity breaks call contracts. |
| `BEHAVIOR_CHANGED` | 70 | Subtle logic shifts may cause silent regressions. |
| `MODIFIED` | 50 | Standard code edit or implementation update. |
| `RENAMED` | 45 | Renaming without alias breaks imports and dynamic lookups. |
| `MOVED` | 40 | File relocation breaks module paths. |
| `ADDED` | 30 | Introducing new code has minimal breaking risk on existing features. |

---

## 3. Mathematical Formula

For an impact at distance $d \ge 0$:

$$Score = \min\left(100, \left(Base \times Decay^d \times \frac{Strength}{100} \times CriticalityMultiplier\right) + ConfidenceBonus\right)$$

Where:
- $Base \in [30, 85]$ is the change type base score.
- $Decay = 0.8$ (attenuates score by 20% for each hop beyond direct).
- $Strength \in [10, 100]$ is the normalized dependency or mapping strength (defaults to 100 for direct mappings).
- $CriticalityMultiplier \in [0.8, 1.25]$ derived from Phase 6.6 feature criticality:
  - `CRITICAL`: 1.25
  - `HIGH`: 1.15
  - `MEDIUM`: 1.00
  - `LOW`: 0.85
- $ConfidenceBonus = \lfloor ConfidenceScore \times 10 \rfloor$ (adds up to 10 points for corroborated evidence).

---

## 4. Score-to-Severity Mapping

```typescript
function scoreToSeverity(score: number): ImpactSeverity {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'NEGLIGIBLE';
}
```

---

## 5. Multi-Path Aggregation

When a feature is reachable via multiple distinct dependency paths from the same change, the engine computes:
- `primaryPath`: The path yielding the highest individual score.
- `aggregateScore`: The primary score boosted by non-overlapping alternate paths:
  $$Score_{final} = \min\left(100, Score_{primary} + \sum_{alt} \frac{Score_{alt}}{4}\right)$$
