# Architecture Guide: Feature Health & Risk Analysis

## 1. System Placement in ProjectMind

Phase 6.6 builds directly upon the foundational layers of ProjectMind:

- **Layer 1**: Repository Extraction (AST, symbols, files, config, commits)
- **Phase 6.1**: Feature Identity & Boundary Definitions (`Feature`, `FeatureScope`)
- **Phase 6.2**: Feature Discovery Engine (`FeatureCandidate`, `Evidence`)
- **Phase 6.3**: Feature-to-Code Mapping (`FeatureResourceMapping`)
- **Phase 6.4**: Feature Dependency Graph (`FeatureDependency`, `FeatureDependencyCycle`)
- **Phase 6.5**: Feature Behavior & Execution Flows (`FeatureBehavior`, `FeatureFlow`)
- **Phase 6.6**: **Feature Health & Risk Analysis Engine**

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1 & Phase 6.1 - 6.5 Knowledge Store                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HealthContext
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FeatureHealthCoordinator                                    │
│ Assembles features, mappings, dependencies, cycles, flows   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FeatureHealthAnalyzer                                       │
│ 1. Runs 12 Signal Providers -> HealthSignal[]               │
│ 2. Runs FeatureRiskDetector -> FeatureRisk[] (deduplicated) │
│ 3. FeatureHealthScorer -> 10 Dimensions, Health, Risks      │
│ 4. Generates Recommendations & Detects Conflicts            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FeatureHealth (Aggregate Root)                              │
│ Validated by FeatureHealthValidator & Stored in Repository  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Core Architectural Principles

1. **Read-Only Invariant**:
   - The health analysis engine is strictly observational.
   - It performs zero filesystem mutations, spawns no child processes, and executes no external network HTTP requests.
   - It cannot cause side-effects in the user's workspace.

2. **Multidimensional Decoupled Scoring**:
   - **Health $\neq$ Risk**: An un-updated, isolated feature may have no active risks, but degraded health.
   - **Criticality $\neq$ Vulnerability**: High criticality reflects architectural importance, not low quality.
   - **Signal $\neq$ Risk**: Signals are factual measurements (e.g. cyclomatic complexity = 35); risks are synthesized potential failures with severity and scope.

3. **Deterministic & Reversible**:
   - Every score calculation is pure and reproducible given the same `HealthContext`.
   - Scores are strictly normalized between 0 and 100.

4. **Provenance & Explainability**:
   - Every signal and risk carries `FeatureRiskEvidence` identifying the source type, resource ID, and metric description.
   - Built-in Markdown generation translates technical metrics into human-readable insights.
