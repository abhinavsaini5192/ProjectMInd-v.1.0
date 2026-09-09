# Incremental Health Analysis

## Invalidation & Propagation

When code or configurations change, re-analyzing the entire repository is inefficient. Phase 6.6 implements an **Incremental Analysis Engine** that propagates updates along the feature dependency graph:

```
                  Changed Feature (F_changed)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
    Upstream Providers              Downstream Dependents
   (Dependencies of F)               (Dependents on F)
```

1. **Marking Stale**:
   - `repository.markStale(changedFeatureIds)` marks changed records as `isStale: true`.
2. **Neighbor Expansion**:
   - Gathers all immediate providers (`dependencies`) and dependents (`dependents`).
3. **Targeted Re-analysis**:
   - Runs `analyzeFeature(id, 'INCREMENTAL')` only on the expanded target set.
4. **Cache Invalidation**:
   - Overwrites prior health scores in `FeatureHealthRepository` and resets `isStale: false`.
