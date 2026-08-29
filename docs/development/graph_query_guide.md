# Graph Query Guide

All graph lookups MUST go through the `GraphQueryEngine`. Direct database connections are prohibited in higher layers.

## Example Queries

### Node Lookup
```typescript
const results = await engine.queryEngine.query('MATCH (a:File)-[:CONTAINS]->(b:Module) RETURN a.path, b.name');
```

### Path Traversal
KuzuDB supports shortest path and bounded-length path algorithms. The `GraphTraversalEngine` abstracts these:
```typescript
// Find all transitive dependencies up to depth 3
const deps = await engine.traversalEngine.getDependencies('module-uuid', 3);
```
