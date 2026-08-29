# Feature Detection

ProjectMind uses an extensible `FeatureDetector` containing multiple `IFeatureDetectionStrategy` plugins.

Examples of future signals:
- **Routes**: `/api/auth/login` strongly hints at an Authentication feature.
- **Database**: Schemas mapping `Users` table hint at User Management.
- **Naming**: Symbols containing `Auth`, `Jwt`, `Session`.
- **Dependencies**: Clusters of symbols that depend heavily on each other but rarely on outside symbols.

Each plugin emits `FeatureSignal` objects containing a `weight`. The `FeatureClassifier` aggregates these to compute a final Confidence score between 0.0 and 1.0.
