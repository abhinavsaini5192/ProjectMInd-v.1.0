# Graph Queries & Pathfinding

## Query Operations

The graph provides high-performance graph traversal and pathfinding APIs:

### 1. Direct Dependencies & Dependents
- `getDependencies(featureId)`: Returns all features directly depended on by `featureId` (outgoing).
- `getDependents(featureId)`: Returns all features directly depending on `featureId` (incoming).

### 2. Shortest Path Search (`findPath`)
Uses Breadth-First Search (BFS) to find the shortest directed dependency path between two features:
```typescript
const path = graph.findPath('feat_billing', 'feat_auth');
// Returns:
// {
//   sourceFeatureId: 'feat_billing',
//   targetFeatureId: 'feat_auth',
//   nodes: ['feat_billing', 'feat_orders', 'feat_auth'],
//   relationships: [...],
//   totalConfidence: 0.81,
//   pathLength: 2
// }
```

### 3. Transitive Dependency Chain (`findDependencyChain`)
Traverses both directions to compute the complete transitive impact footprint:
- `upstream`: All features that transitively depend on this feature (incoming blast radius).
- `downstream`: All features this feature transitively depends upon (upstream dependencies).
- `paths`: List of all `FeatureDependencyPath` paths found during traversal.

### 4. Neighborhood & Isolation
- `getNeighbors(featureId)`: Unique set union of dependencies and dependents.
- `getIsolatedFeatures()`: Features with zero incoming and zero outgoing edges.
