# Semantic Compression

Unlike standard RAG pipelines which naively truncate text when a token limit is hit, ProjectMind uses **Semantic Compression**.

When the Context Intelligence Engine realizes the Context Graph exceeds the Token Budget, it begins demoting the lowest-ranked `OPTIONAL` and `USEFUL` nodes.

## Compression Levels
1. **FULL**: The complete AST representation or raw source code.
2. **SUMMARY**: A generated description of the symbol's purpose and relationships, stripping out the implementation body.
3. **METADATA**: Just the symbol signature (name, parameters, return type) and its file location.

This guarantees that the downstream Agent is still aware of the existence of peripheral dependencies, even if it cannot see their full implementation, preventing hallucinations.
