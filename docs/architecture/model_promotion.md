# Model Promotion

Before a new SLM (or a new version of an existing SLM) can become the default provider for ProjectMind, it must pass the `ModelPromotionEvaluator`.

## Promotion Rules
The evaluator compares the candidate model's `BenchmarkReport` against the baseline model.

1. **No Hallucination Regressions**: If the hallucination rate increases by more than 1%, the model is rejected.
2. **No Precision Regressions**: The model's context precision must not drop significantly.
3. **No Fallback Regressions**: The model must not crash or time out more frequently than the baseline.
4. **Clear Improvement**: To be promoted, the model must demonstrate strictly higher Context Precision, or demonstrate equivalent precision with a >20% reduction in average latency.

This prevents developers from blindly upgrading to the "newest" model if it actually degrades ProjectMind's reliability.
