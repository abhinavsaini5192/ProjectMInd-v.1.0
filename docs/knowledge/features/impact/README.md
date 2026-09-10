# Feature Change Impact Engine (Phase 6.7)

## Overview

The **Feature Change Impact Engine** is the prospective intelligence core of ProjectMind's Feature Intelligence system. While previous phases identified feature boundaries (Phase 6.1), discovered features from repositories (Phase 6.2), mapped features to underlying technical resources (Phase 6.3), mapped semantic dependency graphs (Phase 6.4), traced behavioral execution/data flows (Phase 6.5), and diagnosed multi-dimensional health and risks (Phase 6.6), Phase 6.7 answers the ultimate forward-looking engineering question:

> **"If this code, resource, or feature changes, what other features and resources could be affected, through what path, with what severity and confidence, and why?"**

Phase 6.7 operates purely **read-only** with **zero side-effects**: no code execution, no shell spawning, no tests executed, and no source files modified.

---

## Core Capabilities

1. **Multi-Source Evidence Gathering (11 Impact Sources)**:
   - Evaluates changes against Resource Mappings, Dependency Topologies, Behavioral Flows, Resource Call Graphs, API Endpoints, Database Entities, Integration Adapters, Test Suites, Architecture Modules, and Health/Risk Context.

2. **Controlled Graph Propagation**:
   - Performs BFS/DFS path traversal with cycle detection, visited set tracking, depth limits (`maxDepth`, default 5), and score decay (`decayFactor`, default 0.8 per hop).
   - Enforces strict architectural boundaries: documentation changes never propagate implementation impact; test changes produce `VERIFICATION` impact only.

3. **Deterministic 0–100 Impact Scoring**:
   - Combines change type severity (e.g. `DELETED` 85, `SIGNATURE_CHANGED` 75), distance decay, dependency strength, flow criticality, and target feature criticality.
   - Maps scores deterministically to 5 severity levels: `CRITICAL` (80–100), `HIGH` (60–79), `MEDIUM` (40–59), `LOW` (20–39), and `NEGLIGIBLE` (0–19).

4. **Multi-Evidence Confidence Calculation**:
   - Calculates weighted confidence scores across multiple corroborating sources (e.g., Code Mapping + Semantic Dependency + Flow Execution), scaling levels from `VERY_LOW` to `VERY_HIGH`.

5. **Structural & Behavioral Conflict Resolution**:
   - Detects and resolves conflicts where static dependencies indicate impact but dynamic/behavioral flows bypass or override it, generating transparent conflict records.

6. **Incremental Impact Analysis & Caching**:
   - Computes reverse affected subgraphs to invalidate only stale impact caches, avoiding full re-evaluations for minor commits.

7. **Security & Prompt Injection Hardening**:
   - Treats documentation and commit metadata as untrusted data, validating inputs against prompt injection attacks and redacting sensitive credentials/tokens via `SecuritySanitizer`.

8. **Human-Readable & Machine-Readable Explainability**:
   - Generates structured Markdown and JSON reports detailing root changes, affected features/resources, impact pathways, contributing evidence, and recommended test targets.

---

## Architecture At a Glance

```
                Change Target (File, Symbol, Endpoint, Schema)
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        11 Impact Sources                               │
│  (Mapping, Dependency, Behavior, ResourceRel, Endpoint, Data, etc.)    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Impact Candidate Generator                           │
│  - Raw Candidates                                                      │
│  - Boundary Resolver (Doc/Test guards)                                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Impact Propagation Engine                            │
│  - Resource Propagation  - Feature Propagation                         │
│  - Cycle Detection       - Distance Decay                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│            Resolution, Scoring, and Classification                     │
│  - Impact Resolver (Conflict & Evidence merge)                         │
│  - Impact Scorer (0-100 deterministic scoring)                         │
│  - Impact Classifier (Severity & Confidence)                           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Impact Result                                  │
│  - FeatureImpacts[]     - ResourceImpacts[]                            │
│  - ImpactPaths[]        - ImpactConflicts[]                            │
│  - ImpactExplainer (Markdown & Sanitized Summaries)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Documentation Index

- [Architecture Guide](./ARCHITECTURE.md) — System components, pipeline stages, and design decisions.
- [Impact Model](./IMPACT_MODEL.md) — Data models, entities, and relationships.
- [Propagation System](./PROPAGATION.md) — Multi-hop propagation, cycle prevention, and boundary guards.
- [Impact Types](./IMPACT_TYPES.md) — Direct, indirect, API, data, integration, behavioral, and verification impacts.
- [Scoring Guide](./SCORING.md) — Impact severity formulas, distance decay, and weighting factors.
- [Confidence Assessment](./CONFIDENCE.md) — Evidence-backed confidence calculation and levels.
- [Impact Paths](./IMPACT_PATHS.md) — Causality tracing and hop-by-hop explanation paths.
- [Incremental Analysis](./INCREMENTAL_ANALYSIS.md) — Targeted re-evaluation, delta tracking, and invalidation.
- [Caching System](./CACHING.md) — Key generation, cache invalidation, and TTL management.
- [API Reference](./API.md) — High-level API facade, dependency injection, and events.
- [Security Hardening](./SECURITY.md) — Secret sanitization and prompt injection mitigation.
- [Testing Guide](./TESTING.md) — Unit tests, synthetic test cases, and regression coverage.
