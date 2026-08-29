# SLM Decision Routing

ProjectMind determines whether to ask the SLM for help on a strict, case-by-case basis using the `SLMDecisionRouter`.

## TrustEstimator
Instead of a global "trust" toggle, the `TrustEstimator` maintains specific trust scores for specific task types (e.g., `FEATURE_INTERPRETATION` vs `REASONING_SUMMARY`). These scores are continuously updated based on feedback from the L3.4 Learning Engine. If the SLM hallucinates frequently during Feature Interpretation, its trust score for that specific task plummets.

## Routing Decisions
- **`DETERMINISTIC_ONLY`**: The SLM is completely bypassed. Used for Security Critical decisions or tasks where the SLM's trust score has fallen below threshold.
- **`HYBRID`**: The SLM is queried, but its predictions are heavily dampened and blended with deterministic graph traversal.
- **`SLM_PRIMARY`**: The SLM has proven highly reliable for this specific task type. Its predictions are prioritized, though still subject to hallucination checks.
