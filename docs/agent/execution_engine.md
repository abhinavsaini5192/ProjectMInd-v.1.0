# Execution Engine

Phase 4.5 is the final consumer in the Agent Execution Pipeline. 

## Flow
1. Receives an `ActionGraph` (from Phase 4.3).
2. Receives an `ExecutionContext` populated with security decisions (from Phase 4.4).
3. The `ExecutionScheduler` iterates through the topological sort of the graph.
4. For every action, the `ExecutionEngine` validates the corresponding `SecurityDecision`. If `DENY` or unapproved `REQUIRE_APPROVAL`, it hard-fails the action.
5. If allowed, it routes the action to the appropriate `IActionExecutor` (File, Git, Verification).
6. It waits for the result, marks the action as `SUCCEEDED` or `FAILED`, and continues.
