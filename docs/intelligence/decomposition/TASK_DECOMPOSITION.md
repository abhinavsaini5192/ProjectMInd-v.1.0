# Adaptive Task Decomposition

The `TaskDecomposer` breaks down high-level user tasks into fine-grained, dependency-ordered subtask DAGs.

## Adaptive Granularity
- **Trivial Tasks** ("Rename foo to bar"): Evaluated to complexity `TRIVIAL`, producing a single direct subtask.
- **Medium/Complex Tasks** ("Add JWT authentication"): Decomposed into multi-phase DAG subtasks (`DISCOVERY` $\rightarrow$ `DESIGN` $\rightarrow$ `IMPLEMENTATION` $\rightarrow$ `VERIFICATION`).
- **Graph Validation**: Enforces acyclicity (detects $A \rightarrow B \rightarrow C \rightarrow A$) and validates dependency existence.
