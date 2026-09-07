# Architecture: Feature Behavior & Flow Analysis Engine

## System Overview

The **Feature Behavior & Flow Analysis Engine** operates in Layer 2 of ProjectMind. It transforms mapped technical resources and semantic relationships into structured execution graphs.

```mermaid
flowchart TD
    subgraph Layer 1 & 2 Inputs
        M[Feature Mappings (Phase 6.3)]
        R[Feature Relationships (Phase 6.4)]
        E[Extraction Context (Endpoints, Symbols, Tests)]
    end

    subgraph 13 Signal Sources
        S1[EntryPointSource]
        S2[CallChainSource]
        S3[ControlFlowSource]
        S4[DataFlowSource]
        S5[EndpointFlowSource]
        S6[DatabaseFlowSource]
        S7[EventFlowSource]
        S8[IntegrationFlowSource]
        S9[ValidationFlowSource]
        S10[AuthorizationFlowSource]
        S11[ErrorFlowSource]
        S12[TestBehaviorSource]
        S13[HistoryBehaviorSource]
    end

    subgraph Core Pipeline
        FB[FeatureFlowBuilder]
        FN[FeatureBehaviorNormalizer]
        FA[FeatureBehaviorAnalyzer]
        FR[FeatureFlowResolver]
        FV[FeatureBehaviorValidator]
        FX[FeatureBehaviorExplainer]
    end

    subgraph Output & Storage
        FBE[FeatureBehavior Entity]
        FBR[FeatureBehaviorRepository]
        API[FeatureBehaviorAPI]
    end

    M & R & E --> S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13 --> FB
    FB --> FN --> FA --> FR --> FV --> FBE
    FBE --> FBR
    FBE --> FX
    FBR --> API
```

---

## Core Components

| Component | Responsibility |
| :--- | :--- |
| `FeatureBehaviorEngine` | Central orchestrator handling single feature analysis, batch analysis, and incremental dirty resource runs. |
| `FeatureFlowBuilder` | Stitches disparate behavioral candidates and fragments into connected execution flows based on architectural tiers. |
| `FeatureBehaviorNormalizer` | Eliminates redundant parallel edges and deduplicates equivalent flows while aggregating evidence. |
| `FeatureBehaviorAnalyzer` | Detects cross-feature boundary crossings using Phase 6.4 relationships and calculates calibrated confidence scores. |
| `FeatureFlowResolver` | Classifies flows into `primaryFlows`, `alternativeFlows`, and `failureFlows`, and identifies contradictory execution conflicts. |
| `FeatureBehaviorValidator` | Guarantees referential integrity of node and edge IDs, confidence bounds, and security hygiene. |
| `FeatureBehaviorExplainer` | Produces structured markdown explanations with step sequences, transitions, and boundary highlights. |
| `FeatureBehaviorRepository` | High-performance in-memory repository providing $O(1)$ lookups by feature ID and flow ID. |
| `FeatureBehaviorAPI` | Public facade exposing query operations to agents and external consumers. |
