# Feature Change Impact Engine Architecture

## 1. System Mission & Conceptual Boundaries

The Feature Change Impact Engine (Phase 6.7) computes the prospective causal graph of consequences triggered when a repository element is created, modified, renamed, moved, or deleted.

### Strict Conceptual Boundaries

| Concept | What It Represents | Boundary Rule |
| :--- | :--- | :--- |
| **Impact** | Prospective consequence: *"This change may affect X."* | Must have demonstrable causality or dependency path. |
| **Risk** | Inherent vulnerability/weakness (Phase 6.6): *"X is fragile."* | Risk context elevates impact severity, but never manufactures an impact relationship where no evidence exists. |
| **Health** | Current diagnostic condition (Phase 6.6): *"X has 45% coverage."* | Health informs stability and confidence; it is not impact. |
| **Criticality** | Architectural importance (Phase 6.6): *"X is central to the system."* | Criticality prioritizes impact triage; it does not invent links. |
| **Documentation** | Human-readable prose (`.md`, `.rst`, doc comments). | Documentation changes never propagate implementation impact. |
| **Verification** | Test suites and assertions. | Test changes produce `VERIFICATION` impact only, never functional implementation impact. |

---

## 2. Pipeline Execution Stages

The impact engine executes a deterministic 7-stage pipeline:

```
[1. Target Normalization]
          │
          ▼
[2. Multi-Source Evidence Gathering] (11 Sources)
          │
          ▼
[3. Candidate Generation & Boundary Filtering]
          │
          ▼
[4. Controlled Graph Propagation] (Cycle & Depth Limits)
          │
          ▼
[5. Conflict Detection & Normalization]
          │
          ▼
[6. Impact Scoring & Classification] (0-100 deterministic)
          │
          ▼
[7. Path Synthesis & Result Assembly]
```

### Stage Details

1. **Target Normalization**: Validates change parameters, resolves symbols and file paths, checks for prompt injection in change notes, and constructs canonical `ChangeTarget` instances.
2. **Multi-Source Evidence Gathering**: Concurrently queries 11 specialized impact sources for direct associations with the changed targets.
3. **Candidate Generation & Boundary Filtering**: Aggregates raw candidate impacts and passes them through `ImpactBoundaryResolver` to enforce documentation and test boundaries.
4. **Controlled Graph Propagation**: Recursively traverses downstream relationships (Resource-to-Feature, Feature-to-Feature, and Resource-to-Resource) up to `maxDepth` hops, applying cycle guards and distance score decay.
5. **Conflict Detection & Normalization**: Identifies discrepancies between structural dependencies and behavioral flows, emitting `ImpactConflict` records and normalizing candidate types.
6. **Impact Scoring & Classification**: Computes deterministic 0–100 scores incorporating change type weights, path length decay, dependency strengths, and target criticalities.
7. **Path Synthesis & Result Assembly**: Traces and reconstructs complete causality paths (`ImpactPath`), updates repository state, emits `FeatureImpactAnalyzed` events, and prepares human-readable explanations.

---

## 3. Core Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FeatureImpactAPI (Facade)                       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FeatureImpactEngine                             │
│  - Caching & Cache Invalidation                                        │
│  - Incremental Analysis Router                                         │
│  - Full Repository Impact Analysis                                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     FeatureImpactCoordinator                           │
│  Coordinates Sources, Propagators, Resolver, Scorer, and Explainer     │
└──────┬─────────────────────────────┬───────────────────────────┬───────┘
       │                             │                           │
       ▼                             ▼                           ▼
┌──────────────┐             ┌──────────────┐            ┌──────────────┐
│  11 Sources  │             │ Propagators  │            │ Core Services│
│  - Mapping   │             │ - Resource   │            │ - Resolver   │
│  - Dep       │             │ - Feature    │            │ - Scorer     │
│  - Behavior  │             │ - Dependency │            │ - Classifier │
│  - Endpoint  │             │ - Behavior   │            │ - Validator  │
│  - Data      │             │ - Boundary   │            │ - Explainer  │
│  - ...       │             │   Resolver   │            │ - Normalizer │
└──────────────┘             └──────────────┘            └──────────────┘
```

---

## 4. Architectural Safeguards

1. **Read-Only Safety**: The engine does not invoke runtime code, evaluate user scripts, run shell commands, or modify files.
2. **Deterministic Computation**: Given identical feature graph and change target inputs, the engine produces identical scores, paths, and classifications.
3. **Re-Entrancy & Cycle Protection**: Cycles (e.g. $A \to B \to C \to A$) are detected using visited node sets and truncated without recursion exhaustion.
4. **Security & Data Sanitization**: Untrusted documentation headings and commit descriptions are stripped of prompt injection patterns and secrets before persistence and rendering.
