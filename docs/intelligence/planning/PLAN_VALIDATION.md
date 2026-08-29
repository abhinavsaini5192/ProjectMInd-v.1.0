# Plan Validation

The `PlanValidator` enforces multi-layer validation before any plan can be presented or approved.

## Validation Layers
1. **Staleness**: Checks `knowledgeVersion` against active repository state. If modified, marks plan `STALE`.
2. **Structural Integrity**: Enforces unique step IDs, non-empty targets, and valid action types.
3. **Dependency DAG**: Runs Kahn's algorithm topological sort to detect cyclic dependencies or invalid step references.
4. **Preconditions**: Cross-verifies symbol and file existence in the repository graph.
5. **Safety**: Rejects raw executable payloads or dangerous commands.
6. **Risk Escalation**: Assigns `NEEDS_APPROVAL` status to high-risk, critical, or irreversible actions.
