# Feature Model

A Feature in ProjectMind is a massive semantic clustering object.

```typescript
export interface IFeature {
  id: string; // Deterministic Hash of Feature Name
  name: string;
  confidence: number; 
  signals: FeatureSignal[]; // E.g. { type: 'Naming', weight: 0.5 }
  symbolIds: string[];
  dependencyIds: string[];
  routes: string[];
  testSymbolIds: string[];
  metrics: FeatureMetrics;
}
```

A Feature is not a folder. It can span across `/src/controllers`, `/tests/e2e`, and `/config`. It is a semantic grouping.
