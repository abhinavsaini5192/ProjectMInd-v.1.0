# Context Retrieval

Context retrieval extracts relevant information from ProjectMind's knowledge systems into normalized `ContextItem` instances.

## Retrievers
1. **`KnowledgeRetriever`**: Fetches symbols, modules, relationships, and architecture nodes from Layer 2 knowledge graph APIs.
2. **`MemoryRetriever`**: Queries the `MemoryEngine` for stored decisions, learned patterns, and historical constraints.
3. **`DependencyRetriever`**: Performs bounded graph traversal around explicit task symbols to identify direct upstream and downstream dependencies.
4. **`FeatureRetriever`**: Retrieves feature boundaries, associated symbols, and feature lifecycle states.
5. **`ChangeRetriever`**: Retrieves recent commits, modified symbols, and change history.

## Context Provenance & Trust Model
Every `ContextItem` contains a `ContextSource` array recording:
- `sourceType`: Source system (e.g. `KNOWLEDGE_GRAPH`, `MEMORY`)
- `sourceId`: Unique entity or record ID
- `trustLevel`:
  - `VERIFIED_CODE_FACT`: Hard fact derived directly from code parsing
  - `ANALYZED_ARCHITECTURE`: Synthesized architectural structure
  - `STORED_MEMORY`: Persisted memory from previous tasks
  - `HISTORICAL_INFORMATION`: Change history or git log events
  - `INFERRED_INFORMATION`: Heuristic or probabilistic insight
