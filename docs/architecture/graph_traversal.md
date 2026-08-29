# Graph Traversal Strategies

The `GraphTraversalEngine` isolates the complexity of Cypher path queries into specific use-case functions for the AI layer.

## Algorithms
1. **Shortest Path**: Finding the closest dependency chain between two symbols to provide minimal context to the SLM.
2. **Blast Radius (Impact)**: A reverse-dependency topological sort. If `Symbol A` changes, what calls it?
3. **Dependency Gathering**: Forward lookup to bundle all required imports and types for a given file.
