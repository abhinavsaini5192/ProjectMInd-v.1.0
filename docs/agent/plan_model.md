# Plan Model

## TaskPlan
The top-level model output by the Planner. It contains:
- `objective` and `intent`
- `scope`: The exact list of files and architecture domains the plan affects.
- `steps`: An array of `PlanStep` nodes.
- `risk`: Explicit risk level (LOW, MEDIUM, HIGH, CRITICAL).
- `approvalRequirement`: Boolean indicating if human intervention is required before execution.

## PlanStep
A single node in the execution DAG. It contains:
- `type`: Categorization (INVESTIGATION, ANALYSIS, MODIFICATION, VERIFICATION, etc).
- `dependencies`: An array of `stepId`s that must complete before this step can begin.
