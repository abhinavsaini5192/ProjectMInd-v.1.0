# SLM Architecture

Phase 5.1 implements the SLM Provider & Runtime infrastructure. 

## Separation of Concerns
The SLM layer is purely an execution transport layer. It is responsible for making HTTP requests (or similar) to models like Ollama, vLLM, or OpenAI-compatible endpoints.

**Crucially:**
1. The SLM layer **does not** query ProjectMind repositories or databases.
2. The SLM layer **does not** contain logic to orchestrate reasoning.
3. The SLM layer **does not** execute file modifications.

All reasoning orchestration and safety limits occur in Phase 4.10 (Brain), which passes an `SLMRequest` to the SLM layer and receives an `SLMResponse`.
