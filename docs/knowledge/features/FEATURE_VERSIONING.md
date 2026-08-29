# Feature Versioning & Change History

The `FeatureVersionManager` maintains an immutable append-only journal of all feature modifications.

## Change Types
- `CREATED`: Initial registration.
- `RENAMED`: Name modified without changing `FeatureId`.
- `UPDATED`: General attribute or metadata change.
- `RECLASSIFIED`: `FeatureType` reassigned.
- `REFERENCES_CHANGED`: Resource references added or removed.
- `RELATIONSHIPS_CHANGED`: Semantic relationships updated.
- `STATUS_CHANGED`: Lifecycle status changed (`ACTIVE`, `DEPRECATED`, `DISABLED`).
