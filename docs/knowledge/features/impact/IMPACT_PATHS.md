# Impact Paths & Causality Tracing

## 1. Concept of Impact Paths

An **Impact Path** (`ImpactPath`) is an ordered, directed graph traversal recording the sequence of intermediate hops that connect a changed root target to an affected downstream feature or resource.

Without paths, impact analysis would present disconnected lists of features with no explanation of *how* or *why* a change reaches them.

---

## 2. Structure of an Impact Path

```
[ChangeTarget: AuthService.login()]
                 │
                 ▼ Edge: DIRECT_MAPPING (Weight: 1.0)
[FeatureNode: Authentication]
                 │
                 ▼ Edge: DEPENDS_ON (Weight: 0.85)
[FeatureNode: Checkout]
                 │
                 ▼ Edge: DEPENDS_ON (Weight: 0.80)
[FeatureNode: Order Processing]
```

### Data Representation

```typescript
interface ImpactPath {
  pathId: string;
  sourceTargetId: string;
  targetFeatureId?: string;
  targetResourceId?: string;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  length: number;
  aggregateScore: number;
  aggregateConfidence: number;
  cycleDetected: boolean;
  pathDescription: string;
}
```

- **`nodes`**: Sequence of visited entities (Files, Symbols, Features, Schemas).
- **`edges`**: Relationship types connecting adjacent nodes (`MAPS_TO`, `CALLS`, `DEPENDS_ON`, `FLOWS_TO`, `READS_FROM`).
- **`length`**: Number of edges in the path (0 for direct mapping).
- **`pathDescription`**: Human-readable breadcrumb representation, e.g.:
  `"AuthService.login() -> [Feature: Authentication] -> [Feature: Checkout] -> [Feature: Order Processing]"`

---

## 3. Path Pruning & Ranking

When complex topologies generate dozens of redundant paths between the same source and destination:

1. **Shortest & Strongest Path First**: Paths are ranked primarily by highest composite score, and secondarily by shortest hop count.
2. **Top-K Preservation**: The engine preserves up to 3 primary paths per affected feature to keep diagnostic outputs concise and actionable.
3. **Cycle Truncation**: When a path intersects an already visited node in the active traversal stack, traversal along that path stops immediately, and `cycleDetected: true` is flagged on the path.
