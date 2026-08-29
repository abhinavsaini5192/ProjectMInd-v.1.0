# SLM Architecture

ProjectMind treats Small Language Models (SLMs) strictly as non-deterministic intelligence providers, wrapped in deterministic bounds. The Brain does not trust the SLM.

## SLMGateway
The `SLMGateway` handles request routing, capability checking, and invocation. It interfaces with `ISLMProvider` adapters (e.g. local ONNX or HTTP models) so ProjectMind is never locked into a single model architecture.

## SLMOutputValidator
All SLM predictions must pass Zod schema validation. More importantly, the validator checks every predicted feature and context symbol against the known ProjectMind Knowledge Graph. If the SLM hallucinates a file that does not exist, the prediction is immediately rejected.

## SLMFallbackManager
If the SLM times out, fails schema validation, or hallucinates, the `SLMFallbackManager` intercepts the failure and seamlessly routes the system back to the fully deterministic L3.3 Reasoning Engine. ProjectMind can run 100% offline without any model downloaded.
