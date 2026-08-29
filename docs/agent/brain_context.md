# Brain Context Assembly

To prevent token exhaustion and maintain strict relevance, the `ContextAssemblyEngine` operates on a deterministic pipeline.

1. **Querying**: The system queries the graph for relevant nodes (Symbols, Architecture, Memory).
2. **Ranking**: Nodes are sorted by mathematical priority. (Task definitions > Direct symbols > Dependencies > Historic Memory).
3. **Budgeting**: The `ContextBudgetManager` iterates through the ranked nodes. Once the estimated token usage exceeds the configured maximum (e.g., 4000 tokens), all remaining lower-priority nodes are discarded.

The Brain will **never** blindly dump the entire repository into a prompt.
