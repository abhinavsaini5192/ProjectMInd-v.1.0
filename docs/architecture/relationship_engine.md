# Relationship Engine Architecture

The `RelationshipEngine` transforms the isolated semantic identities (Symbols) extracted in Layer 2.3 into a richly connected **Semantic Knowledge Graph**.

## Lifecycle
1. **Extraction**: The `RelationshipExtractor` walks structural syntax (AST) or deep semantic scopes and identifies associations between Symbol IDs.
2. **Construction**: The `RelationshipBuilder` formalizes the connection, attaching the precise `RelationshipEvidence` (e.g., the line of code that triggered it).
3. **Evolution**: The `RelationshipLifecycleManager` hashes the metadata and evidence. If the relationship already exists and the hash matches, it bypasses updates. If it has changed, it bumps the version.
4. **Validation**: The `RelationshipValidator` ensures there are no illegal self-loops or duplicate edges.
5. **Registration**: Validated relationships are loaded into the `RelationshipRegistry` for instant O(1) Graph Traversal via `RelationshipResolver`.
