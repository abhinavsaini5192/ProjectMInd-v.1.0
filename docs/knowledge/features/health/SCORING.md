# Scoring Methodology & Dimension Weights

## 1. Dimension Score Calculation

Each of the 10 dimensions begins at a baseline score of `100`. Signals mapped to that dimension apply penalties based on their severity and normalized metric:

$$\text{Dimension Score} = \max\left(0, 100 - \sum \left(\text{Penalty}(\text{severity}) \times \frac{\text{normalizedValue}}{100}\right)\right)$$

### Severity Penalty Scale

- **CRITICAL**: $-50$ points
- **HIGH**: $-30$ points
- **MEDIUM**: $-15$ points
- **LOW**: $-5$ points
- **INFO**: $-2$ points

---

## 2. Overall Health Score Calculation

The overall health score is a weighted sum of the 10 dimension scores:

$$\text{Overall Health Score} = \frac{\sum_{i=1}^{10} \left(\text{Score}_i \times \text{Weight}_i\right)}{\sum_{i=1}^{10} \text{Weight}_i}$$

### Default Weights

| Dimension | Default Weight |
| :--- | :---: |
| `VERIFICATION_HEALTH` | $0.15$ |
| `STRUCTURAL_HEALTH` | $0.10$ |
| `DEPENDENCY_HEALTH` | $0.10$ |
| `BEHAVIOR_HEALTH` | $0.10$ |
| `ARCHITECTURE_HEALTH` | $0.10$ |
| `STABILITY_HEALTH` | $0.10$ |
| `INTEGRATION_HEALTH` | $0.10$ |
| `SECURITY_HEALTH` | $0.10$ |
| `COMPLEXITY_HEALTH` | $0.10$ |
| `CONFIDENCE_HEALTH` | $0.05$ |

---

## 3. Overall Risk Score Calculation

The overall risk score blends the maximum risk severity ($60\%$) with the average risk score ($40\%$):

$$\text{Risk Score} = \text{round}\left(0.6 \times \max(\text{Risk Scores}) + 0.4 \times \text{avg}(\text{Risk Scores})\right)$$

This ensures that a single catastrophic vulnerability (e.g. leaked private key or circular dependency deadlock) cannot be hidden behind trivial low-risk items, while still factoring in cumulative exposure.
