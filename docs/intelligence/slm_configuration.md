# SLM Configuration

ProjectMind SLM configuration is provider-agnostic. 

Example configuration:
```json
{
  "provider": "local",
  "model": "qwen-coder",
  "endpoint": "http://localhost:8000",
  "temperature": 0.1,
  "contextWindow": 32768,
  "maxOutputTokens": 4096,
  "timeout": 60000
}
```

This configuration object is passed to the `SLMManager`, which automatically provisions the correct provider implementation (`LocalHTTPProvider`, `OllamaProvider`, etc.) based on the `provider` string.
