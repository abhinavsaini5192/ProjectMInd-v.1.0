# SLM Runtime

The `SLMRuntime` and `SLMManager` manage the lifecycle of the active provider.

## Context Window Enforcement
Before sending a request to the network, the `SLMRuntime` calculates an estimate of token usage. If the request exceeds the active model's `contextWindow`, the runtime immediately throws a `SLMConfigurationError` (`CONTEXT_TOO_LARGE`). It does not silently truncate (context budgeting is the responsibility of the Brain).

## Health Monitoring
`SLMHealthMonitor` continually polls the provider. If the model goes offline, it returns `UNAVAILABLE`. The Brain checks this before initiating heavy reasoning sequences, preventing hanging requests.
