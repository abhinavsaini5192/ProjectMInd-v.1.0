# Local Inference

The `InferenceManager` acts as the execution layer that connects a `ModelSelectionResult` to the actual `SLMRuntime`.

## Inference Sessions
Every generation request creates an `InferenceSession`. This allows ProjectMind to track:
- `latencyMs`
- `tokenUsage`
- `startedAt` and `completedAt` timestamps
- Linkage to a `brainSessionId`

By isolating inference behind the `InferenceManager`, the Brain remains decoupled from provider HTTP calls or vendor-specific API keys.
