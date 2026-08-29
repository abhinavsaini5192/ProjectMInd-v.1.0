# Reasoning Security

Security and isolation are core invariants of the Structured Reasoning Engine.

## Security Invariants
1. **Untrusted Model Input**: All outputs from the SLM are treated as untrusted data until validated by the `ReasoningValidator`.
2. **Data vs Instructions**: Context items extracted from repositories are labeled as data, preventing prompt injection attacks from hijacking system reasoning rules.
3. **No Direct Execution**: The reasoning layer is strictly prohibited from invoking `child_process`, writing to files, or communicating with external networks. Execution is exclusively the domain of the Agent Runtime and Execution Engine (Phases 4.4 & 4.5).
