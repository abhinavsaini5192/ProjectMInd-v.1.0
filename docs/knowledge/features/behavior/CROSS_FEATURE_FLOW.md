# Cross-Feature Execution Boundaries

## Overview

Complex workflows in a software application cross multiple architectural feature boundaries.

For example, when a user completes an order in the **Checkout** feature:
$$\text{Checkout} \xrightarrow{\text{calls}} \text{Payment Processing} \xrightarrow{\text{verifies}} \text{Authentication}$$

---

## Architectural Boundary Detection

The `FeatureBehaviorAnalyzer` references the Feature Dependency Graph from Phase 6.4 (`FeatureRelationship`) and multi-feature resource mappings:

```mermaid
flowchart LR
    subgraph Feature: Checkout
        C1[CheckoutController] --> C2[CheckoutService]
    end

    subgraph Feature: Payment Processing
        P1[PaymentService.charge]
    end

    C2 -->|CALLS [Boundary Crossing]| P1
```

When a boundary hop occurs:
1. `node.metadata.featureBoundary` is set to `true`.
2. `node.metadata.targetFeatureId` is annotated with the target feature ID (e.g. `'feat_payment'`).
3. The connecting edge carries `edge.metadata.featureBoundary: true`.

This provides seamless end-to-end tracing across feature frontiers without conflating feature ownership.
