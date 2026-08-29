# Query Execution Pipeline

1. **Validation**: `QueryValidator` verifies the query shape and strips away sensitive parameters via security heuristic rules.
2. **Caching**: Checks the `QueryCache` via a compound hashed key.
3. **Planning**: `QueryPlanner` builds a deterministic execution plan mapped to `QueryRegistry` handlers.
4. **Execution**: `QueryExecutor` executes the plan across disparate registries.
5. **Explainability**: `QueryExplainer` attaches deterministic trace logs to the result.
