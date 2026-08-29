# SLM Security

SLMs are inherently susceptible to prompt injection and data leakage. ProjectMind isolates the SLM from the core system.

1. **No Execution Rights**: The SLM is not an agent. It cannot modify files or run terminal commands.
2. **Privacy Filtering**: All `SLMRequest` task descriptions pass through the `PrivacyFilter` to redact API keys and PII before hitting the model.
3. **Restricted View**: The SLM never sees raw source code unless explicitly scoped into a small context window. It reasons over high-level AST features and symbols.
