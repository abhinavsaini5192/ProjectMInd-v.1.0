# Feature Metrics

The Feature Engine aggregates L2.5 metrics into holistic Domain metrics:

- **Size**: Total number of symbols inside the feature.
- **Coupling**: The efferent coupling of the entire feature to other features.
- **Cohesion**: The ratio of internal dependencies vs external dependencies.
- **Coverage**: The percentage of symbols inside this feature that are connected to a `testSymbol`.
- **Volatility**: Tracks how often this feature is modified (useful for AI risk assessment).
