# Feature Discovery Engine (Phase 6.2)

## Architectural Overview

The **Feature Discovery Engine** analyzes existing Layer 1 and Layer 2 knowledge (endpoints, modules, symbols, dependencies, configurations, tests, documentation, and history) within a repository to infer, score, validate, and register high-level semantic **Features**.

```
                         DiscoveryContext
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOVERY SOURCES (8)                        │
│ Endpoint │ Module │ Symbol │ Dependency │ Test │ Config │ Docs │ Hist │
└───────────────────────────────┬─────────────────────────────────┘
                                ↓
                     FeatureCandidateGenerator
                                ↓
                     FeatureCandidateNormalizer
                                ↓
                     FeatureEvidenceAggregator
                                ↓
                      FeatureCandidateScorer
                 (Weights + Source Diversity Bonus)
                                ↓
                     FeatureDuplicateDetector
            (Overlap & Resource / Scope Collision)
                                ↓
                     FeatureCandidateValidator
                  (Generic Utility Exclusion)
                                ↓
                   Candidate Ranking & Promotion
                                ↓
               FeatureRegistry & Manual Protection
```

---

## Key Principles & Guarantees

1. **Evidence-Based Inference (No LLM Guessing)**
   - Candidate generation is grounded in deterministic repository signals with quantifiable strength (`VERY_STRONG`, `STRONG`, `MEDIUM`, `WEAK`).
   - Pure guessing or assuming "directory = feature" is strictly avoided.

2. **Source Diversity & Confidence Scoring**
   - High-confidence features require multi-source convergence.
   - Evidence weights:
     - Endpoints: `0.25`
     - Symbols: `0.20`
     - Tests: `0.20`
     - Dependencies: `0.15`
     - Modules: `0.08`
     - Configurations: `0.05`
     - Documentation: `0.04`
     - Commit History: `0.03`
   - Candidates supported by 3 or more distinct sources receive a `+0.10` source diversity coherence bonus.

3. **Manual Feature Protection**
   - Features created with `origin: FeatureOrigin.MANUAL` are strictly protected.
   - Discovered candidates matching a manual feature attach new evidence and references without modifying the feature ID or changing `origin` away from `MANUAL`.

4. **Negative Utility Exclusion**
   - Generic utility symbols (e.g. `logger`, `stringUtils`, `dateUtils`, `mathHelper`) are filtered by `SymbolFeatureSource` and rejected by `FeatureCandidateValidator`.

5. **Security & Redaction**
   - Sensitive tokens (AWS keys, JWTs, private keys, database passwords) in configuration keys or git commit history are automatically redacted before evidence generation.
   - Documentation is treated as untrusted data; prompt injection attempts are safely neutralized and handled as inert text.

6. **Explainability Without Hallucination**
   - `explainCandidate(candidateId)` returns structured evidence, source attribution, score breakdown, confidence rationale, and reference lists without exposing raw LLM chain-of-thought dumps.

7. **Incremental Discovery**
   - `discoverIncremental(context, changedResourceIds)` re-evaluates only candidates referencing modified files or symbols, preserving state for unaffected features.

---

## Discovery Sources

| Source | Input Signal | Evidence Type | Default Strength |
| :--- | :--- | :--- | :--- |
| **EndpointFeatureSource** | HTTP routes (`POST /api/login`) | `API_ROUTE` | `VERY_STRONG` |
| **ModuleFeatureSource** | Module manifests & directories | `DIRECTORY_CLUSTER` | `MEDIUM` |
| **SymbolFeatureSource** | Exported classes/interfaces | `IMPLEMENTATION_SYMBOL` | `STRONG` |
| **DependencyFeatureSource** | Component dependency chains | `DEPENDENCY_CHAIN` | `STRONG` |
| **TestFeatureSource** | Test suites (`auth.test.ts`) | `TEST_SUITE` | `STRONG` |
| **ConfigurationFeatureSource** | Config keys (`JWT_SECRET`) | `CONFIGURATION_KEY` | `MEDIUM` (Redacted) |
| **DocumentationFeatureSource** | Markdown guides (`docs/auth.md`) | `DOCUMENTATION_SECTION` | `MEDIUM` (Sanitized) |
| **HistoryFeatureSource** | Commit messages | `COMMIT_HISTORY` | `MEDIUM` (Redacted) |

---

## Public API & DI Integration

```typescript
import { FeatureDiscoveryAPI } from './api/FeatureDiscoveryAPI';
import { FeatureDiscoveryEngine } from './core/FeatureDiscoveryEngine';
import { FeatureRegistry } from '../core/FeatureRegistry';

const registry = new FeatureRegistry();
const engine = new FeatureDiscoveryEngine(registry);
const discoveryApi = new FeatureDiscoveryAPI(engine);

// 1. Run full discovery
const result = await discoveryApi.discover({
  workspaceId: 'ws_main',
  repositoryId: 'repo_main',
  endpoints: [...],
  symbols: [...],
  tests: [...],
});

// 2. Explain candidate
const explanation = discoveryApi.explain(result.candidates[0].candidateId);

// 3. Promote candidate
const feature = await discoveryApi.promote(result.candidates[0].candidateId);
```
