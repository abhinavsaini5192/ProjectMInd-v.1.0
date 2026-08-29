# SLM Provider Interface

ProjectMind is fundamentally agnostic to the underlying AI model. 

The `ISLMProvider` dictates the boundary. It accepts an `SLMRequest` (intent + context) and must return an `SLMResponse` (containing the parsed `BrainDecision`).

Whether the provider is backed by `Ollama`, `llama.cpp`, `OpenAI`, or `Anthropic`, the internal Brain architecture remains identical and perfectly protected by the `DecisionValidator`.
