# Incremental Impact Analysis

## 1. Why Incremental Analysis?

In large repositories with hundreds of features and thousands of source files, re-evaluating the entire impact graph on every code edit or file save is computationally wasteful.

**Incremental Impact Analysis** allows the engine to compute the exact impact delta for only the modified targets, reusing cached subgraphs for untouched regions of the codebase.

---

## 2. Invalidation & Scope Resolution

When an incremental request is received (`api.analyzeIncremental(changes)`):

1. **Target Identification**: Extract affected resource and feature IDs from the `ChangeTarget[]` array.
2. **Reverse Subgraph Traversal**:
   - Determine which features directly own the changed resources.
   - Determine which downstream features depend on those features.
   - Collect the set of `affectedFeatureIds`.
3. **Selective Cache Eviction**:
   - Invalidate cached impact results only for keys referencing the changed targets or affected features.
   - Untouched feature trees remain intact in the cache.
4. **Targeted Re-Evaluation**:
   - Execute the 7-stage impact pipeline scoped strictly to the invalidation boundary.
   - Merge newly calculated impacts with the persisted repository state.

---

## 3. Example Scenario

Suppose a developer modifies `PasswordResetService` (mapped to `Authentication`):

```
Untouched:
  [Catalog] ──────────> [Inventory] ──────> [Shipping] (Zero recomputation)

Modified Path:
  PasswordResetService
         │
         ▼
  [Authentication]
         │
         ▼
     [Checkout]
```

- **Recomputed**: `Authentication` and downstream `Checkout`.
- **Untouched**: `Catalog`, `Inventory`, `Shipping`, `PaymentGateway`.
- **Performance**: Analysis completes in under 10ms instead of scanning the full workspace.
