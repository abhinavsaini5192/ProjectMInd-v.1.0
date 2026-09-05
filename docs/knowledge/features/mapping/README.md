# Phase 6.3: Feature-to-Code Mapping Engine

## Overview

The **Feature-to-Code Mapping Engine** provides the authoritative, bidirectional semantic link between high-level project **Features** (discovered in Phase 6.2 or registered in Phase 6.1) and technical implementation **Resources** in the codebase.

In ProjectMind, a feature mapping is **not** a simplistic `Feature → File` pointer. Instead, it is an evidence-backed tuple:

$$\text{Feature} \to \text{Resource} \to \text{Resource Type} \to \text{Relationship Role} \to \text{Evidence} \to \text{Confidence} \to \text{Mapping}$$

```
                                 ┌────────────────────────┐
                                 │   Feature Registry     │
                                 └───────────┬────────────┘
                                             │ Feature
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Feature-to-Code Mapping Coordinator                             │
│                                                                                        │
│  ┌────────────────────┬────────────────────┬────────────────────┬───────────────────┐  │
│  │ FileMappingSource  │ SymbolMappingSource│ ModuleMappingSource│EndpointMappingSrc │  │
│  ├────────────────────┼────────────────────┼────────────────────┼───────────────────┤  │
│  │ DependencyMapping  │ ConfigurationMap   │ DatabaseMapping    │ TestMappingSource │  │
│  ├────────────────────┼────────────────────┼────────────────────┼───────────────────┤  │
│  │ UIComponentMapping │ CommandMapping     │ DocMappingSource   │ (11 Sources)      │  │
│  └────────────────────┴────────────────────┴────────────────────┴───────────────────┘  │
└────────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ Mapping Candidates
                                             ▼
                             ┌───────────────────────────────┐
                             │     FeatureMappingScorer      │ (Weighted + Diversity Bonus)
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    FeatureMappingValidator    │ (Scope & Utility Exclusion)
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    FeatureMappingResolver     │ (Conflict & Dominant Roles)
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │   FeatureMappingRepository    │ (Bidirectional Indexes)
                             └───────────────────────────────┘
```

---

## Key Capabilities

1. **Multi-Source Semantic Aggregation (11 Signal Providers)**:
   Extracts mapping candidates across files, exported symbols, modules, API endpoints, package dependencies, configuration settings, database schemas/repositories, test suites, UI components, CLI commands, and technical documentation.

2. **Many-to-Many Relationships**:
   Resources can serve multiple features with distinct semantic roles (e.g., `UserRepository` acts as `STORAGE` for `Authentication` and `IMPLEMENTATION` for `User Management`).

3. **Protection of Manual User Mappings (`source = MANUAL`)**:
   Explicit developer annotations are strictly preserved: they are never overwritten, downgraded, or deleted by automated discovery runs. Automated signals only enrich the evidence graph.

4. **Negative Filtering & Noise Resistance**:
   Generic utility files (`stringUtils.ts`, `date.ts`, `logger.ts`, `/common/`, `/helpers/`) and universal dependencies (`lodash`, `chalk`, `date-fns`, `vitest`) are prevented from being mistakenly classified as feature implementations.

5. **Bidirectional Reverse Lookups**:
   Fast O(1) query indexing for both forward queries (`featureId → mappings`) and reverse queries (`resourceId → features`).

6. **Explainability & Security Hardening**:
   Every mapping carries citations and explanations without raw LLM scratchpads. Configuration values with secrets (JWTs, API tokens, passwords) are automatically redacted, and markdown documents are treated as untrusted text to prevent prompt injection.

---

## Quickstart

```typescript
import { FeatureMappingAPI } from './api/FeatureMappingAPI';
import { FeatureMappingEngine } from './core/FeatureMappingEngine';
import { FeatureRegistry } from '../core/FeatureRegistry';
import { FeatureMappingRepository } from './repository/FeatureMappingRepository';

// Initialize services
const registry = new FeatureRegistry();
const repository = new FeatureMappingRepository();
const engine = new FeatureMappingEngine(registry, repository);
const api = new FeatureMappingAPI(engine);

// Map a feature
const result = await api.mapFeature('feat_auth', {
  workspaceId: 'ws-1',
  repositoryId: 'repo-1',
  symbols: [...],
  endpoints: [...]
});

// Reverse lookup: find which features a file/symbol implements
const linkedFeatures = await api.getResourceFeatures('src/auth/AuthService.ts');
// ['feat_auth']

// Explain a mapping
const explanation = await api.explain('map_auth_service');
console.log(explanation.reasoningSummary);
```
