# Architecture: Feature-to-Code Mapping Engine

## Architectural Position

The Feature-to-Code Mapping Engine lives within Layer 2 of ProjectMind (Semantic & Structural Knowledge) as part of the Feature Intelligence subsystem:

```
┌────────────────────────────────────────────────────────┐
│ Layer 3: Agent & Intelligence Runtime                  │
│ (Planning, Closed-Loop Reasoning, Execution)           │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ Layer 2: Feature Intelligence                          │
│                                                        │
│  Phase 6.1: Feature Model & Identity                   │
│      │                                                 │
│      ▼                                                 │
│  Phase 6.2: Feature Discovery Engine                   │
│      │                                                 │
│      ▼                                                 │
│  Phase 6.3: Feature-to-Code Mapping Engine ◄──[WE ARE HERE]
│      │ (Binds features to files, symbols, endpoints,   │
│      │  configs, dependencies, tests, commands, DB)    │
│      ▼                                                 │
│  Phase 6.4: Feature Dependency Graph                   │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ Layer 1: Repository Intelligence & Extraction          │
│ (AST, Symbols, Endpoints, Dependencies, Config, Tests) │
└────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. `FeatureMappingCoordinator`
Orchestrates the 11 specialized mapping sources. Provides per-source fault isolation so that if one source encounters malformed input or errors, remaining sources continue unaffected.

### 2. `FeatureMappingScorer`
Computes multi-source weighted scores for each candidate mapping using configurable weights (`DEFAULT_MAPPING_WEIGHTS`). Awards a **diversity bonus** (+0.10) when a resource is validated by two or more independent signal sources.

### 3. `FeatureMappingValidator`
Enforces workspace and repository scope boundaries, resource existence verification, and negative utility exclusion.

### 4. `FeatureMappingResolver`
Consolidates candidates for the same `(featureId, resourceId)` pair:
- Aggregates evidence lists without duplication.
- Assigns the dominant role using the role priority hierarchy (`ENTRY_POINT > IMPLEMENTATION > API > STORAGE > CONFIGURATION > ...`).
- **Strictly protects manual mappings (`source = MANUAL`)**: preserves user-selected role, scope, and provenance while merging new discovery evidence.

### 5. `FeatureMappingRepository`
In-memory transactional repository maintaining bidirectional indexes:
- `featureId → Set<mappingId>` for forward queries.
- `resourceId → Set<mappingId>` for reverse lookups.
- Soft-deletes stale resources with `deactivationReason = 'RESOURCE_REMOVED'`, preserving audit history.

### 6. `FeatureMappingExplainer`
Generates human-readable, structured explanations detailing evidence breakdown, confidence levels, and conflict citations without raw chain-of-thought scratchpads.

### 7. `FeatureMappingAPI`
Public, ergonomic facade exposed through the workspace dependency injection container (`registerFeatureMappingServices`).

---

## Data Flow Diagram

```
       Feature + MappingContext
                 │
                 ▼
     ┌───────────────────────┐
     │  Mapping Sources (11) │  ─── Multi-Signal Candidate Extraction
     └───────────┬───────────┘
                 │ Candidates
                 ▼
     ┌───────────────────────┐
     │ FeatureMappingScorer  │  ─── Weighted Confidence & Diversity Bonus
     └───────────┬───────────┘
                 │ Scored Candidates
                 ▼
     ┌───────────────────────┐
     │FeatureMappingValidator│  ─── Scope & Negative Utility Filtering
     └───────────┬───────────┘
                 │ Valid Candidates
                 ▼
     ┌───────────────────────┐
     │FeatureMappingResolver │  ─── Conflict Resolution & Role Priority
     └───────────┬───────────┘
                 │ Canonical Mappings
                 ▼
     ┌───────────────────────┐
     │FeatureMappingRepositor│  ─── Bidirectional Indexing & Persistence
     └───────────┬───────────┘
                 │
                 ▼
        Kernel Event Bus        ─── Lifecycle Events Dispatched
```
