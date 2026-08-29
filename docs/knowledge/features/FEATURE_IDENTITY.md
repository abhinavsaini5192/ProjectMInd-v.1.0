# Feature Identity & Stability

`FeatureId` represents an immutable, globally unique identifier.

## Invariant Rules
1. **Name Independent**: Generated from repository and semantic tokens, prefixed with `feat_`. Changing the display name does NOT alter `FeatureId`.
2. **File Path Independent**: Moving or refactoring underlying source files does NOT alter `FeatureId`.
3. **Survives Version Progression**: Renames, status updates, and reference modifications preserve the original identity while incrementing version records.
