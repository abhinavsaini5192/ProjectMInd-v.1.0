# SLM Providers

The Brain interfaces exclusively with `ISLMProvider`. 

Currently supported implementations:
1. `LocalHTTPProvider`: Raw HTTP POST implementation for unstandardized local models.
2. `OllamaProvider`: Designed to map Ollama's specific `/api/generate` structure into the normalized `SLMResponse`.
3. `OpenAICompatibleProvider`: Designed to map standard OpenAI JSON responses (commonly used by local servers like vLLM) into `SLMResponse`.
4. `MockSLMProvider`: A crucial deterministic provider for unit tests. It allows injecting forced failures, timeouts, and hallucinations without a real model.
