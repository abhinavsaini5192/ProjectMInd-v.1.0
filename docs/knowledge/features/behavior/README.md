# ProjectMind: Feature Behavior & Flow Analysis Engine (Phase 6.5)

## Overview

The **Feature Behavior & Flow Analysis Engine** reconstructs the execution paths, control branching, data transformations, asynchronous boundaries, and cross-feature interactions of features in ProjectMind.

While earlier phases establish:
- **Phase 6.1**: Feature Identity & Canonical Feature Model
- **Phase 6.2**: Feature Discovery Engine
- **Phase 6.3**: Feature-to-Code Mapping (Feature $\to$ Technical Resources)
- **Phase 6.4**: Feature Dependency Graph (Feature $\to$ Feature Dependencies)

**Phase 6.5** establishes how features actually execute:
$$\text{Entry Point} \xrightarrow{\text{Step}} \text{Validation} \xrightarrow{\text{Step}} \text{Service} \xrightarrow{\text{Step}} \text{Persistence/Integration} \xrightarrow{\text{Step}} \text{Response/Exit}$$

---

## Architectural Principles

1. **Semantic, Not Source-Code Text**:
   Behavior is represented using discrete, structured entities (`FeatureFlow`, `FeatureFlowNode`, `FeatureFlowEdge`). The engine does not store raw source code snippets or duplicate low-level AST nodes.

2. **Zero Duplicate Scanners**:
   Phase 6.5 reuses existing Layer 1 extraction artifacts (`endpoints`, `symbols`, `dependencies`, `configurations`, `tests`, `databaseEntities`, `integrationEvents`) and Layer 2 knowledge (Mappings and Relationships).

3. **Multi-Flow Coexistence**:
   Features like Authentication maintain separate flows for distinct entry points (e.g. `Password Login`, `OAuth Login`, `Token Refresh`, `Logout`) without collapsing them into an entangled monolith.

4. **Preserved Asynchronous Boundaries**:
   Event hops, message queues, and worker jobs preserve `asynchronous: true` flags on edges and nodes.

5. **Cross-Feature Architectural Boundaries**:
   Execution crossing into other features (e.g. Checkout invoking Payment Service) marks boundary nodes with `featureBoundary: true` and `targetFeatureId`.

6. **Defense in Depth**:
   Sensitive credentials (passwords, tokens, AWS keys, secrets) are sanitized via `SecuritySanitizer.redactSecrets`. Prompt injection attempts in documentation or metadata are filtered.

---

## Guide Index

- [Architecture & Pipeline](file:///docs/knowledge/features/behavior/ARCHITECTURE.md)
- [Behavior Model](file:///docs/knowledge/features/behavior/BEHAVIOR_MODEL.md)
- [Flow Model](file:///docs/knowledge/features/behavior/FLOW_MODEL.md)
- [Flow & Step Types](file:///docs/knowledge/features/behavior/FLOW_TYPES.md)
- [Entry Points Discovery](file:///docs/knowledge/features/behavior/ENTRY_POINTS.md)
- [Call Chain Analysis](file:///docs/knowledge/features/behavior/CALL_CHAIN_ANALYSIS.md)
- [Data Flow & Transformations](file:///docs/knowledge/features/behavior/DATA_FLOW.md)
- [Control Flow & Decision Branching](file:///docs/knowledge/features/behavior/CONTROL_FLOW.md)
- [Event & Asynchronous Messaging](file:///docs/knowledge/features/behavior/EVENT_FLOW.md)
- [External Integrations](file:///docs/knowledge/features/behavior/INTEGRATION_FLOW.md)
- [Failure & Resilience Paths](file:///docs/knowledge/features/behavior/ERROR_FLOW.md)
- [Cross-Feature Execution Boundaries](file:///docs/knowledge/features/behavior/CROSS_FEATURE_FLOW.md)
- [Incremental Analysis](file:///docs/knowledge/features/behavior/INCREMENTAL_ANALYSIS.md)
- [Confidence Calibration](file:///docs/knowledge/features/behavior/CONFIDENCE.md)
- [Explainability & Narratives](file:///docs/knowledge/features/behavior/EXPLAINABILITY.md)
- [Security & Sanitization](file:///docs/knowledge/features/behavior/SECURITY.md)
- [Testing & Verification](file:///docs/knowledge/features/behavior/TESTING.md)
