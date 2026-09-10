# Impact Caching System

## 1. Caching Strategy

The Feature Change Impact Engine implements an in-memory, deterministic caching layer inside `FeatureImpactEngine` to ensure instant responses for repeated queries and predictable performance under high-frequency IDE interactions.

---

## 2. Cache Key Generation

Cache keys are constructed deterministically from:
- `targetId`: Unique resource or feature identifier.
- `changeType`: Operation type (`MODIFIED`, `DELETED`, `ADDED`, etc.).
- `optionsHash`: Hash of options (`maxDepth`, `minScoreThreshold`, `direction`).
- `knowledgeVersion`: Version of the underlying feature graph state.

```typescript
const cacheKey = `impact:${change.targetId}:${change.changeType}:${optionsHash}:${knowledgeVersion}`;
```

If the underlying feature topology changes (e.g. new mapping added, dependency updated), the `knowledgeVersion` increments, automatically isolating stale cache entries.

---

## 3. TTL & Eviction Policies

1. **Default TTL**: Configurable, defaults to 300,000ms (5 minutes).
2. **LRU Eviction**: Caps maximum cache entries (default: 500 entries) to prevent unbounded memory growth.
3. **Explicit Invalidation**:
   - `engine.invalidateCache(targetId)` evicts all entries referencing a target.
   - `engine.clearCache()` flushes the entire cache on major workspace re-scans.
   - `analyzeIncremental()` automatically selectively evicts affected subgraphs.
