# SLM Metrics

The `SLMMetricCalculator` computes the following metrics during benchmark runs:

1. **Context Precision**: The percentage of the SLM's predicted context that was actually required to solve the task. High precision = no wasted tokens.
2. **Context Recall**: The percentage of the *required* context that the SLM successfully predicted. High recall = the AI agent will not get stuck missing files.
3. **Missing Context Rate**: `1.0 - Context Recall`.
4. **Hallucination Rate**: The percentage of tasks where the SLM recommended a repository entity (file, symbol, feature) that does not actually exist in the ProjectMind Knowledge Graph.
5. **Fallback Rate**: The percentage of requests where the SLM failed, timed out, or hallucinated, forcing ProjectMind to fall back to the deterministic Brain.
6. **Average Latency**: Measured in milliseconds.
