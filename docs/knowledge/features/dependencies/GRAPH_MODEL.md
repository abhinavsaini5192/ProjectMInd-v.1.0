# Graph Model & In-Memory Representation

## Data Structure

`FeatureDependencyGraph` implements `IFeatureDependencyGraph` as an in-memory directed graph with dual adjacency maps:

```typescript
class FeatureDependencyGraph implements IFeatureDependencyGraph {
  // O(1) Node lookup
  private nodes: Map<string, Feature>;

  // Outgoing adjacency: sourceFeatureId -> (targetFeatureId -> FeatureRelationship)
  private outgoing: Map<string, Map<string, FeatureRelationship>>;

  // Incoming adjacency: targetFeatureId -> (sourceFeatureId -> FeatureRelationship)
  private incoming: Map<string, Map<string, FeatureRelationship>>;

  // Edge lookup by ID
  private relationshipById: Map<string, FeatureRelationship>;
}
```

---

## Edge Characteristics

- **Directed Edges**: $A \to B$ indicates Feature A depends on, consumes, or uses Feature B.
- **Bidirectional Edges**: When a relationship is symmetrical (`SHARES_RESOURCE`, `SHARES_DATA`, `COORDINATES`, `INTEGRATES_WITH`), both directed edges $A \to B$ and $B \to A$ point to the same underlying `FeatureRelationship` entity.
- **Self-Loops Rejected**: $A \to A$ is structurally prohibited.
- **Node Removal Cascade**: Removing a feature cleanly cascades, removing all connected incoming and outgoing edges from the adjacency index.
