# Feature Health API & DI Setup

## 1. FeatureHealthAPI Facade

`FeatureHealthAPI` provides a clean programmatic interface for interacting with feature health intelligence:

```typescript
import { FeatureHealthAPI } from 'src/knowledge/features/health/index.js';

const api = new FeatureHealthAPI(engine, repository);

// Single feature assessment with executive summary
const assessment = await api.analyzeFeature('feat_auth');

// Repository-wide analysis
const result = await api.analyzeRepository('workspace_1', 'repo_1');

// Query degraded or critical features
const highRiskFeatures = await api.queryHighRiskFeatures();
const degradedFeatures = await api.queryDegradedFeatures();

// Natural language / Markdown explanation
const explanation = await api.explainFeatureHealth('feat_auth');
```

---

## 2. Dependency Injection Setup

Register Phase 6.6 services with the `DIContainer`:

```typescript
import { DIContainer } from 'src/workspace/di/DIContainer.js';
import { registerFeatureHealthServices, FeatureHealthTokens } from 'src/knowledge/features/health/index.js';

const container = new DIContainer();
registerFeatureHealthServices(container);

const engine = container.resolve(FeatureHealthTokens.Engine);
const api = container.resolve(FeatureHealthTokens.API);
```

---

## 3. Events

Phase 6.6 emits lifecycle events:

- `FeatureHealthEvents.AnalysisStarted`: Analysis run started.
- `FeatureHealthEvents.SignalDetected`: Health signal detected.
- `FeatureHealthEvents.RiskDetected`: Synthesized risk identified.
- `FeatureHealthEvents.HealthDegraded`: Status transitioned to DEGRADED or HIGH_RISK.
- `FeatureHealthEvents.HealthStale`: Feature health marked stale.
- `FeatureHealthEvents.AnalysisCompleted`: Analysis run finished.
