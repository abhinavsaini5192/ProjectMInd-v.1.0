# Impact Analysis Architecture

The `ImpactAnalyzer` is responsible for calculating the "blast radius" of a semantic event.

## Mechanism
1. It reads the `metadata.symbol` or `impact` paths from a generated `SemanticEvent`.
2. It invokes the `GraphTraversalEngine` (built in Phase W2.4).
3. It performs a reverse-dependency lookup (Topological Sort).
4. The returned list of dependents is handed to the **UpdatePlanners** (`ContextUpdatePlanner`, `MemoryUpdatePlanner`) to surgically invalidate specific intelligence blocks, rather than rebuilding the entire repository context.
