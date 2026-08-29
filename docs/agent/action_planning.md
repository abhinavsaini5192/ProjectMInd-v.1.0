# Action Planning Engine

Phase 4.3 translates abstract execution plans (`TaskPlan`) into concrete, strongly-typed operations (`ActionGraph`).

## Action Graph
The `ActionPlanner` uses specific `IActionGenerator` implementations to turn a single `PlanStep` (e.g., INVESTIGATION) into one or more `AgentAction`s.

These actions form a strict Directed Acyclic Graph (DAG). If a modification step depends on an investigation step, the resulting `EDIT_FILE` action will depend explicitly on the `READ_FILE` action.

## Safety Boundaries
Phase 4.3 enforces hard execution limits via the `ActionType` enumeration.
- **No `RUN_SHELL`**: ProjectMind does not support executing arbitrary bash/powershell strings. 
- **Typed Verification**: Testing must be invoked via `RUN_TEST`, `RUN_LINT`, or `RUN_TYPECHECK`.
- **Typed Modification**: File changes use `EDIT_FILE` or `CREATE_FILE`.

This guarantees that all actions remain auditable, predictable, and structurally valid before the Executor (Phase 4.5) attempts to run them.
