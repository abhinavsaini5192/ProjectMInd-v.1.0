# Incremental Updates & Stale Cleanup

## Incremental Re-evaluation

When developers commit changes to specific files, functions, or endpoints, re-scanning the entire repository graph is wasteful:

```typescript
const result = await engine.updateIncremental(['src/billing/BillingService.ts'], context);
```

### Process:
1. **Target Identification**: Uses `FeatureMappingRepository` to identify which features map to the changed resources.
2. **Selective Discovery**: Runs discovery sources **only for the affected features**.
3. **Graph Synchronization**: Updates existing edges in the `FeatureDependencyGraph`, preserving untouched relationships.
4. **Cycle Re-check**: Re-runs cycle detection only on connected subgraphs.

---

## Stale Relationship Deactivation

When code refactorings remove an import or route invocation:
- Relationships previously discovered that are no longer supported are **deactivated** with `deactivationReason = 'RELATIONSHIP_REMOVED'`.
- Deactivated edges are immediately removed from the active `FeatureDependencyGraph`.
- **Manual Protection Rule**: If an existing relationship has `source = 'MANUAL'`, it is **never deactivated** during stale sweeps!
