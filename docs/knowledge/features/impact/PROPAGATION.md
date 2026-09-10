# Impact Graph Propagation

## 1. Propagation Overview

Changes to low-level resources (methods, functions, endpoints, database schemas) propagate outward along the repository's semantic and technical graph topologies. The **Impact Propagation Engine** navigates these graphs systematically while enforcing strict boundary guards, depth constraints, and cycle prevention.

---

## 2. Propagation Vectors

Impact travels across three primary relationship axes:

```
[Resource Change]
       │
       ▼ (Mapping Propagation)
[Directly Mapped Feature]
       │
       ▼ (Dependency Propagation)
[Downstream Features] (A -> B -> C)
       │
       ▼ (Behavioral Flow Propagation)
[Execution / Data Flow Nodes]
```

### 1. Resource-to-Feature Mapping Propagation (`ResourceImpactPropagator`)
- Identifies features directly associated with the modified resource via `FeatureResourceMapping`.
- Computes direct feature candidates with distance 0.

### 2. Feature-to-Feature Dependency Propagation (`FeatureImpactPropagator` & `DependencyImpactPropagator`)
- Evaluates outgoing semantic dependencies (`DEPENDS_ON`, `CALLS`, `USES`, `EXTENDS`, `REQUIRES`).
- Follows downstream edges: If Feature A depends on Feature B, modifying Feature B propagates impact to Feature A.
- Applies per-hop distance decay to impact scores ($Score_{hop+1} = Score_{hop} \times 0.8$).

### 3. Behavioral Flow Propagation (`BehaviorImpactPropagator`)
- Traces execution flows (`FeatureFlow`) containing mapped entry points or call nodes.
- Checks if the changed resource is in the critical execution path, primary flow, or fallback flow.

---

## 3. Boundary Resolution (`ImpactBoundaryResolver`)

To prevent noise and false positives, all propagations pass through boundary resolution rules:

| Boundary Rule | Action Taken | Rationale |
| :--- | :--- | :--- |
| **Documentation Boundary** | Suppress implementation impact. | Changes to markdown or comments cannot alter runtime behavior. |
| **Test Boundary** | Divert impact to `VERIFICATION`. | Modifying a unit test affects test verification confidence, not product implementation. |
| **Workspace Boundary** | Restrict propagation to authorized scope. | Prevents foreign workspace contamination in multi-root setups. |
| **Weak Relationship Boundary** | Discard weak similarity. | Naming similarity without dependency edge cannot manufacture impact. |

---

## 4. Cycle Detection & Safety Controls

Circular dependencies (e.g. $A \to B \to C \to A$) are common in complex codebases. The engine prevents infinite loops via:

1. **Visited Sets**: Tracks `visitedFeatures` and `visitedResources` with current path stacks.
2. **Back-Edge Detection**: When a node is encountered that is already in the current traversal stack, a cycle is flagged, recorded in statistics, and traversal along that path is terminated.
3. **Configurable Depth Limit (`maxDepth`)**: Defaults to 5 hops; paths exceeding this depth are pruned.
4. **Distance Decay (`decayFactor`)**: Defaults to 0.8 per hop. Impacts that decay below a minimum threshold (`minScoreThreshold = 5`) are dropped.
