# SLM Evaluation

The `SLMComparisonEngine` allows ProjectMind developers to continuously evaluate model performance against the deterministic baseline.

Metrics tracked:
- **Hallucination Detected**: Did the model invent a file?
- **Context Overlap**: How much did the SLM agree with the deterministic planner?
- **Inference Latency**: Tracked in `SLMMetadata` per request.

Over time, this data is piped into the L3.4 Decision Learning Engine to determine if an SLM is actually improving agent outcomes, or just adding latency.
