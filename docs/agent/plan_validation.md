# Plan Validation

The `PlanValidator` acts as a safety firewall. It receives the draft `TaskPlan` and rejects it if it violates core ProjectMind principles.

## Enforcement Rules
1. **Acyclic Graphs**: It runs a topological sort. If `Step A` depends on `Step B` which depends on `Step A`, the plan is rejected.
2. **Mandatory Verification**: It recursively searches the DAG downstream from every `MODIFICATION` step. If the modification doesn't eventually trigger a `VERIFICATION` step, the plan is rejected. The agent is not allowed to write code without testing it.
