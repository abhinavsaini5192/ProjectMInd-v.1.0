# Mapping Scoring & Evidence Aggregation

## Scoring Philosophy

Feature-to-code mapping operates on **probabilistic evidence aggregation**. A mapping's confidence should never depend on arbitrary guesses; it is mathematically determined from:

1. **Source Reliability Weights**: Different sources provide varying degrees of authority.
2. **Evidence Strength Multipliers**: Strong direct assertions are weighted higher than partial token matches.
3. **Source Diversity Bonus**: Independent corroboration across distinct sources significantly increases confidence.
4. **Baseline Guarantees**: A strong single signal (such as an explicit HTTP endpoint route) retains high confidence even in isolation.

---

## Default Source Weights

Defined in `DEFAULT_MAPPING_WEIGHTS`:

| Source Type | Default Weight | Rationale |
|---|---|---|
| `ENDPOINT` | **0.25** | API routes directly expose the external feature surface |
| `SYMBOL` | **0.20** | Classes and functions contain the primary business logic |
| `TEST` | **0.15** | Test suites explicitly verify feature behavior |
| `DEPENDENCY` | **0.10** | External packages provide dedicated capabilities |
| `DATABASE` / `DATABASE_ENTITY` | **0.08** | Persistent models store state for the feature |
| `FILE` | **0.06** | File path naming reflects directory structure |
| `MODULE` | **0.05** | High-level container boundaries |
| `CONFIGURATION` | **0.04** | Configuration keys configure feature execution |
| `UI_COMPONENT` | **0.03** | Visual interfaces presenting the feature |
| `COMMAND` | **0.02** | CLI entrypoints triggering features |
| `DOCUMENTATION` | **0.02** | Descriptive guides (untrusted text evidence) |

---

## Formula

$$\text{RawScore} = \sum_{s \in \text{Sources}} \left( \min(1.0, \text{EvidenceCount}_s) \times \text{Weight}_s \right)$$

### Single-Source Baseline
If a candidate has strong evidence from an authoritative single source (such as a route with confidence $0.95$), the baseline is preserved:

$$\text{Baseline} = \max_{e \in \text{Evidence}} (e.\text{confidence} \times e.\text{strength})$$
$$\text{Score} = \max(\text{RawScore}, \text{Baseline})$$

### Cross-Source Diversity Bonus
When a resource candidate is corroborated by **two or more distinct sources** (e.g., Symbol + Test, or Endpoint + File + Symbol), a diversity bonus is awarded:

$$\text{CoherenceBonus} = +0.10 \quad (\text{if } |\text{Sources}| \ge 2)$$
$$\text{FinalScore} = \min(1.0, \text{Score} + \text{CoherenceBonus})$$

---

## Score Breakdown Example

For a candidate `AuthService.ts`:
- Symbol match (`ClassDeclaration AuthService`): $+0.20$
- Test verification (`authService.test.ts`): $+0.15$
- Cross-source diversity bonus: $+0.10$
- **Total Score**: $0.95$ $\to$ `VERY_HIGH` confidence.
