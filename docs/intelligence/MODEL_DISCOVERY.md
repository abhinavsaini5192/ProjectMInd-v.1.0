# Model Discovery

Model Discovery allows ProjectMind to dynamically identify available Small Language Models across multiple providers.

## How it works
The `ModelDiscovery` service iterates through all registered `ISLMProvider` implementations (e.g., Ollama, OpenAI-compatible, Local HTTP). It invokes `listModels()` on each provider. The provider normalizes its internal model list into ProjectMind's `ModelRecord` interface.

These records are then inserted into the `ModelRegistry`.

## Refreshing
Calling `discovery.refresh()` queries all providers and updates the `ModelRegistry`. It also instructs the registry to mark any models not seen in the last 5 minutes as `UNAVAILABLE`.
