# Feature Health & Risk Analysis Engine (Phase 6.6)

## Overview

The **Feature Health & Risk Analysis Engine** is the multidimensional diagnostic core of ProjectMind's Feature Intelligence system. While earlier phases established feature identity (Phase 6.1), feature discovery (Phase 6.2), code resource mapping (Phase 6.3), inter-feature dependency topologies (Phase 6.4), and behavioral flows (Phase 6.5), Phase 6.6 answers the critical engineering question:

> **"How healthy, reliable, and risky is this feature?"**

Rather than relying on single metrics or simplistic formulas, Phase 6.6 performs evidence-backed, multi-perspective evaluation across **10 Health Dimensions**, **12 Health Signal Providers**, and **11 Synthesized Risk Detectors**.

---

## Core Capabilities

1. **Deterministic Multi-Dimensional Scoring (0–100)**:
   - Evaluates 10 distinct health dimensions: Structural, Dependency, Behavior, Verification, Architecture, Stability, Integration, Security, Complexity, and Confidence.
   - Computes an aggregate health score and maps it deterministically to 7 health statuses (`HEALTHY`, `STABLE`, `ATTENTION_REQUIRED`, `DEGRADED`, `HIGH_RISK`, `CRITICAL`, `UNKNOWN`).

2. **Decoupled Risk vs. Health vs. Criticality**:
   - **Health $\neq$ Risk**: Low risk does not imply high health (an untested, unused feature may have low immediate risk but poor health).
   - **Criticality $\neq$ Vulnerability**: High criticality reflects architectural centrality and system importance, not defectiveness.
   - **Signal $\neq$ Risk**: Signals are factual observations (e.g., LOC, missing test); risks are synthesized potential failure exposures.

3. **12 Comprehensive Signal Providers**:
   - Complexity, Coupling, Dependency, Verification, Behavior, Architecture, Stability, Change Frequency, Integration, Security, Confidence, and Resource concentration.

4. **11 Synthesized Risk Detectors with Deduplication**:
   - Aggregates multi-signal evidence into deduplicated risks, elevating severity when compounded issues arise.

5. **Read-Only, Zero-Side-Effect Safety**:
   - Pure analysis without file modification, subprocess spawning, or network calls.
   - Built-in `SecuritySanitizer` redactSecrets defense and prompt injection mitigation.

6. **Incremental & Full Analysis Modes**:
   - Supports repository-wide full analysis, targeted batch analysis, and dependency-aware incremental updates.

---

## Architecture At a Glance

```
Feature Context (6.1 - 6.5)
         │
         ▼
┌───────────────────────────────────────────────────────────┐
│              12 Health Signal Providers                   │
│ (Complexity, Coupling, Dependency, Verification, etc.)    │
└────────────────────────────┬──────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌─────────────────────────┐
│  11 Risk Detectors    │         │  10 Health Dimensions   │
│   & Deduplication     │         │   & Health Scorer       │
└───────────┬───────────┘         └───────────┬─────────────┘
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ FeatureHealth Engine  │
                 │   & Aggregate Root    │
                 └───────────────────────┘
```

---

## Documentation Index

- [Architecture Guide](./ARCHITECTURE.md) — System components, data flows, and design decisions.
- [Health Model](./HEALTH_MODEL.md) — Aggregate root, dimensions, and statuses.
- [Signal System](./SIGNALS.md) — All 12 signal providers and signal types.
- [Risk Model](./RISK_MODEL.md) — Risk classification, deduplication, and severities.
- [Scoring Guide](./SCORING.md) — Exact scoring formulas, weights, and normalizers.
- [Criticality & Stability](./CRITICALITY.md) — Centrality, churn, and volatility formulas.
- [Verification Quality](./VERIFICATION.md) — Coverage, flow verification, and test ratios.
- [Incremental Analysis](./INCREMENTAL_ANALYSIS.md) — Invalidation and propagation algorithms.
- [API Reference](./API.md) — High-level API facade, dependency injection, and events.
- [Security Hardening](./SECURITY.md) — Secret sanitization and prompt injection defenses.
- [Testing Guide](./TESTING.md) — Unit, integration, and synthetic test suites.
