# Task Planning Engine

The `TaskPlanner` intercepts raw user tasks and generates structured execution plans.

## Workflow
1. **Understanding**: The raw input is parsed into an intent (e.g., `BUG_FIX`, `FEATURE`) and an objective.
2. **Context Enrichment**: The `IBrainGateway` provides a highly confident Context Package representing the isolated repository blast radius.
3. **Ambiguity Check**: If the task lacks clarity ("Fix it"), the `AmbiguityDetector` throws an error, immediately halting planning before dangerous assumptions are made.
4. **Strategy Selection**: The planner selects an `IPlanningStrategy` to generate an ordered DAG (Directed Acyclic Graph) of steps.
5. **Validation**: The `PlanValidator` ensures the DAG contains no circular dependencies and that every `MODIFICATION` step has a trailing `VERIFICATION` step.
