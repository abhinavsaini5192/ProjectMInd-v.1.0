# Feature Change Impact API Reference

## 1. High-Level Facade (`FeatureImpactAPI`)

The `FeatureImpactAPI` class provides a developer-friendly entry point for querying prospective impact analysis.

```typescript
import { createImpactContainer } from './di/ImpactDISetup';
import { FeatureImpactAPI } from './api/FeatureImpactAPI';

// Initialize container and API
const container = createImpactContainer();
const api = container.resolve<FeatureImpactAPI>('FeatureImpactAPI');
```

---

## 2. Core API Methods

### `analyzeChange(change, options?)`
Performs impact analysis for a single change target.
```typescript
const result = await api.analyzeChange(
  {
    targetId: 'src/services/AuthService.ts',
    symbolName: 'AuthService.login',
    changeType: 'MODIFIED',
  },
  {
    maxDepth: 4,
    minScoreThreshold: 10,
  }
);

console.log(`Detected ${result.featureImpacts.length} affected features`);
```

### `analyzeBatch(changes, options?)`
Analyzes multiple changes occurring in a single commit or pull request.
```typescript
const result = await api.analyzeBatch([
  { targetId: 'src/services/AuthService.ts', changeType: 'MODIFIED' },
  { targetId: 'src/database/schema.sql', changeType: 'MODIFIED' },
]);
```

### `analyzeIncremental(changes, options?)`
Performs incremental re-evaluation, invalidating only affected subgraphs.
```typescript
const result = await api.analyzeIncremental([
  { targetId: 'src/services/AuthService.ts', changeType: 'MODIFIED' },
]);
```

### `getImpactsForFeature(featureId)`
Retrieves all active impacts currently recorded for a specific feature.
```typescript
const impacts = await api.getImpactsForFeature('feat_checkout');
```

### `explainImpact(result)`
Generates a formatted, sanitized Markdown explanation of an impact result.
```typescript
const report = api.explainImpact(result);
console.log(report);
```

---

## 3. Events (`FeatureImpactEvents`)

The engine emits domain events via `EventEmitter`:

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `feature.impact.analyzed` | `{ result: ImpactResult }` | Fired when an impact analysis run completes. |
| `feature.impact.invalidated` | `{ targetIds: string[] }` | Fired when cache entries or stored impacts are invalidated. |
| `feature.impact.conflict` | `{ conflict: ImpactConflict }` | Fired when structural vs. behavioral discrepancies are detected. |
