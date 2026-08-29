# Semantic Dependency Engine

The Semantic Dependency Engine (L2.5) elevates structural relationships into semantic architectural meaning. While Layer 2.4 answers "what connects to what", Layer 2.5 answers "why, how, and with what impact".

## Subsystems

- **Dependency Extractor**: Upgrades raw relationships into `Code`, `Module`, `Package`, `Runtime`, or `ExternalService` dependencies.
- **Dependency Graph Builder**: Traces long semantic chains (`A -> B -> C`) to evaluate total systemic impacts.
- **Dependency Registry & Resolver**: Dual-indexes outgoing and incoming chains for instantaneous O(1) impact lookups.

## Key Features
- **Confidence Scoring**: Not all dependencies are equal. A direct `import` is a 1.0 confidence. An inferred runtime dependency might be 0.7.
- **Feature Extensibility**: (Reserved for L2.6). Every dependency has an optional hook to tie it back to a human-understandable Feature string.
- **Incremental Updates**: Dependency versioning strictly tracks changes. Heavy analysis only reruns if structural edges shift.
