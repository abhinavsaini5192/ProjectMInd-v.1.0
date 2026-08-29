# Knowledge Graph Engine Architecture

The Knowledge Graph Engine forms the semantic core of ProjectMind v2.0. By persisting code as a unified graph of symbols, modules, and dependencies, ProjectMind can perform AI context retrieval securely and deterministically without hallucinating relationships.

## Core Components
- **KuzuKnowledgeStore**: The `IStorageProvider` binding the Engine to the KuzuDB backend.
- **KnowledgeGraphEngine**: The orchestrator facade managing queries, traversals, and builds.
- **GraphBuilder**: Encapsulates atomic Cypher `CREATE` commands to ingest new nodes/edges.
- **GraphQueryEngine**: Exposes raw semantic lookup mapping to KuzuDB queries.
- **GraphTraversalEngine**: Executes high-level impact and dependency chain algorithms.

## Flow
1. **Parser Layer** extracts AST and imports.
2. **GraphBuilders** format them into `GraphNode` and `GraphEdge` objects.
3. **GraphBuilder** pushes them via `KuzuKnowledgeStore`.
4. The **Context Engine** uses the **GraphQueryEngine** to answer "Find all dependencies of X".
