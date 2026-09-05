# Incremental Mapping & Change Blast Radius

## Overview

Re-evaluating thousands of files and symbols across an entire enterprise repository on every keystroke or commit is prohibitively slow. Phase 6.3 implements **Incremental Mapping** via dirty resource tracking and reverse lookup indexing.

---

## Workflow

```
File Modified / Saved (e.g. src/auth/AuthService.ts)
                    │
                    ▼
   FeatureMappingRepository.getResourceFeatures(changedResourceId)
                    │
                    ▼
     [feat_auth]  (Only affected feature IDs)
                    │
                    ▼
   FeatureMappingCoordinator.coordinateFeatureMapping(feat_auth)
                    │
                    ▼
   Untouched Features (e.g. feat_billing, feat_search) Remain Untouched!
```

---

## Algorithm

1. **Query Reverse Index**:
   Given an array of changed resource IDs `[res_1, res_2, ...]`, call:
   ```typescript
   const affectedFeatureIds = new Set<string>();
   for (const resId of changedResourceIds) {
     const featIds = await this.repository.getResourceFeatures(resId);
     featIds.forEach(id => affectedFeatureIds.add(id));
   }
   ```
2. **Re-evaluate Only Affected Features**:
   Only features that currently map to the changed resources (or new resources matching registered feature patterns) are passed to `mapFeature()`.
3. **Preserve Untouched Mappings**:
   Mappings for non-affected features are neither recomputed nor cleared. Their `mappingId` and `mappingVersion` remain intact.
4. **Detect Stale Mappings**:
   If a resource previously mapped to `feat_auth` is no longer present in the updated context, it is flagged as stale and marked `active: false` with `deactivationReason = 'RESOURCE_REMOVED'`.

---

## Performance Characteristics

- **Time Complexity**: $O(K \times S)$, where $K$ is the number of affected features (typically $1 \le K \le 3$) and $S$ is the number of mapping sources, independent of total repository size $N$.
- **Zero Cache Invalidation Overhead**: Unrelated features maintain 100% cache hits.
