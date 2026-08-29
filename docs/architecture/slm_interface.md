# SLM Interface Contract

All SLM providers must implement `ISLMProvider`:

```typescript
export interface ISLMProvider {
  getCapabilities(): SLMCapabilities;
  predict(request: SLMRequest): Promise<SLMResponse>;
  isHealthy(): Promise<boolean>;
}
```

## Input vs Output
The SLM only receives a scoped `SLMRequest`. It does not receive the full codebase.
It must return a structured `SLMPrediction` (JSON).

## Task Types
The SLM is restricted to specific tasks. It cannot execute arbitrary code or autonomous loops.
- `FEATURE_INTERPRETATION`
- `CONTEXT_RANKING`
- `AMBIGUITY_RESOLUTION`
- `SEMANTIC_SIMILARITY`
- `REASONING_SUMMARY`
