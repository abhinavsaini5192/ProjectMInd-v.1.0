# ProjectMind: Feature Dependency Graph (Phase 6.4)

## Overview

The **Feature Dependency Graph** establishes semantic, explainable, evidence-backed relationships **between features** in ProjectMind.

While earlier layers focus on physical extraction and technical mappings:
- **Layer 1**: Physical code extraction (files, AST symbols, imports, endpoints, configs, tests, database schemas, git history).
- **Layer 2 (Phase 6.1)**: Semantic Feature Model & Identity.
- **Phase 6.2**: Feature Discovery Engine.
- **Phase 6.3**: Feature-to-Code Mapping Engine (Features $\to$ Technical Resources).

**Phase 6.4** lifts lower-level code dependencies, API endpoint interactions, shared resources, database foreign keys, configuration cross-references, module containment, integration events, architectural layering, test suites, and change histories to project high-level semantic dependencies:

$$\text{Feature A} \xrightarrow{\text{Relationship}} \text{Feature B}$$

---

## Core Capabilities

1. **18 Semantic Relationship Types**:
   `DEPENDS_ON`, `REQUIRED_BY`, `PROVIDES`, `CONSUMES`, `USES`, `INTEGRATES_WITH`, `EXTENDS`, `SPECIALIZES`, `COMPOSES`, `COORDINATES`, `SHARES_RESOURCE`, `SHARES_DATA`, `AUTHORIZES`, `TRIGGERS`, `FEEDS`, `OBSERVES`, `VERIFIES`, `ASSOCIATED_WITH`.

2. **10 Specialized Signal Sources**:
   - `CodeDependencySource`: Code imports and invocations $\to$ `DEPENDS_ON`.
   - `SharedResourceSource`: Shared technical assets $\to$ `SHARES_RESOURCE`.
   - `EndpointInteractionSource`: Protected endpoints & API routes $\to$ `DEPENDS_ON` / `CONSUMES`.
   - `DataDependencySource`: Schema foreign keys & readers $\to$ `USES` / `SHARES_DATA`.
   - `ConfigurationDependencySource`: Cross-feature settings $\to$ `INTEGRATES_WITH`.
   - `ModuleDependencySource`: Module containment & orchestration $\to$ `DEPENDS_ON` / `COORDINATES`.
   - `IntegrationDependencySource`: Pub/Sub event publishers & consumers $\to$ `TRIGGERS` / `CONSUMES`.
   - `ArchitectureDependencySource`: Platform foundation $\to$ `PROVIDES` / `DEPENDS_ON`.
   - `TestRelationshipSource`: Integration test verification $\to$ `VERIFIES` (supporting signal).
   - `HistoryRelationshipSource`: Git co-change coupling $\to$ `ASSOCIATED_WITH` (low confidence).

3. **Multi-Source Weighted Scoring**:
   Combines signal strengths from all 10 sources, preserves single-source authoritative baselines, and applies a **+0.10 source diversity bonus** when relationships are corroborated by two or more independent signal types.

4. **In-Memory Directed Graph & BFS Pathfinding**:
   $O(1)$ node and edge indexing with forward and backward adjacency maps. Supports shortest path queries, upstream/downstream transitive dependency chain exploration, and neighbor discovery.

5. **Cycle Detection & Risk Classification**:
   Detects cyclic dependencies without destructive deletion. Classifies cycles into:
   - `VALIDATED_CYCLE`: Confirmed by high-confidence direct code/API signals.
   - `SUSPECTED_CYCLE`: Involving low-confidence or circumstantial evidence.
   - `ARCHITECTURAL_RISK`: Hard circular coupling between core features.

6. **Manual Relationship Protection**:
   User-curated relationships (`source: 'MANUAL'`) are strictly immutable against automated downgrade or deletion.

7. **Explainability & Security**:
   Structured evidence-based explanations with risk factors and plain English narratives. Zero secret leakage (`SecuritySanitizer` redaction) and read-only codebase execution.
