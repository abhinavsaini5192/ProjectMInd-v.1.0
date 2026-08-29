# Action Planning

The `ActionPlanner` delegates to domain-specific `PlanningStrategy` instances to translate a `Decision` into a structured, acyclic `ActionPlan`.

## Planning Strategies
1. **`BugFixPlanner`**: Phased execution: `INSPECT` $\rightarrow$ `TEST` (reproduce) $\rightarrow$ `MODIFY` $\rightarrow$ `VALIDATE`.
2. **`FeaturePlanner`**: Architectural assessment $\rightarrow$ Module scaffolding $\rightarrow$ Unit tests.
3. **`RefactoringPlanner`**: Behavior-preserving structural edits $\rightarrow$ Coupling verification $\rightarrow$ Full regression suite.
4. **`ArchitectureChangePlanner`**: Cross-layer migrations $\rightarrow$ High-risk escalation (`NEEDS_APPROVAL`).
5. **`InvestigationPlanner`**: Information gathering when reasoning indicates uncertainty or missing logs.
