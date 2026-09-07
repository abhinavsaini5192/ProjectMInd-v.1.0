# Incremental Analysis & Staleness

## Overview

In large codebases containing hundreds of features, re-analyzing the entire repository on every minor file change is prohibitive.

The `FeatureBehaviorEngine.analyzeIncremental` method provides dirty resource tracking and selective re-analysis.

---

## Invalidation Algorithm

```
Changed Resource IDs
        ↓
Directly Affected Features (Features mapping the changed resources)
        ↓
Indirectly Affected Features (Features whose flows cross boundaries into directly affected features)
        ↓
Targeted Re-analysis Subset
```

1. **Direct Impact**: Features whose mappings contain any of the `changedResourceIds` are flagged for re-analysis.
2. **Boundary Impact**: Features that have active boundary transitions pointing to the directly affected features are also re-evaluated.
3. **Untouched Features**: Features independent of the change are not touched, preserving their cached state and timestamps.
4. **Version Increment**: Updated behaviors receive an incremented `behaviorVersion` (e.g. $1 \to 2$).
