# Semantic Graph Model

The ProjectMind Knowledge Layer is modeled as a massive Directed Graph:

- **Nodes**: Canonical `Symbol` objects (IDs guaranteed to survive refactoring if signatures remain stable).
- **Edges**: `Relationship` entities connecting source Symbol IDs to target Symbol IDs.

## In-Memory Traversal
The `RelationshipResolver` permits instantaneous graph traversal without touching a database layer:
```typescript
const outgoingEdges = resolver.getOutgoing('sym_UserClassId');
const dependencies = outgoingEdges.filter(e => e.type === RelationshipType.Imports);
```
