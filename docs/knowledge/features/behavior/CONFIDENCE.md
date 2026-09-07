# Confidence Calibration

## Overview

ProjectMind calibrates behavior confidence scores using multi-source corroboration and discrete confidence tiers.

---

## Calibration Formula

The confidence score is computed by `FeatureBehaviorAnalyzer.computeConfidence`:

$$S = \text{clamp}_{[0.1, 1.0]}\left( \bar{S}_{\text{flows}} + B_{\text{test}} + B_{\text{align}} - P_{\text{conflict}} \right)$$

Where:
- $\bar{S}_{\text{flows}}$: Average confidence of all reconstructed flows.
- $B_{\text{test}}$: **+0.08** corroboration bonus if integration or unit tests cover the flow.
- $B_{\text{align}}$: **+0.05** corroboration bonus if endpoint routes match code call chains.
- $P_{\text{conflict}}$: **-0.15** penalty for each open, unresolved `FeatureBehaviorConflict`.

---

## Discrete Tiers

| Score Range | Level | Interpretation |
| :--- | :--- | :--- |
| $[0.90, 1.00]$ | `VERY_HIGH` | Verified by automated tests, AST call chains, and explicit routes. |
| $[0.70, 0.90)$ | `HIGH` | Strong code and structural evidence. |
| $[0.45, 0.70)$ | `MEDIUM` | Inferred from partial symbols or architectural patterns. |
| $[0.20, 0.45)$ | `LOW` | Circumstantial or single-source evidence. |
| $[0.00, 0.20)$ | `VERY_LOW` | Speculative or heavily conflicted flows. |
