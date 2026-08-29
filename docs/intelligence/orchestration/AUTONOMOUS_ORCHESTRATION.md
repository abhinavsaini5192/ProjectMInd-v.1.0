# Autonomous Agent Loop & Orchestration

The `AutonomousAgentLoop` orchestrates multi-stage iterations from task ingestion to memory recording.

## Loop Lifecycle Stages

1. **`THINKING`**: Gathers token-budgeted context and executes structured reasoning with grounded evidence cross-checks.
2. **`PLANNING`**: Formulates a `Decision` and builds an acyclic topological `ActionPlan`.
3. **`AWAITING_APPROVAL`**: Halts execution when high-risk, destructive, or critical changes are detected.
4. **`EXECUTING`**: Dispatches approved action graphs to `ExecutionBridge` and `IntelligentCodeModificationEngine`.
5. **`VERIFYING`**: Performs multi-tier verification (syntax, symbols, dependencies, tests, builds).
6. **`RECOVERING`**: Evaluates failures with `RecoveryBridge` to trigger bounded repair iterations or initiate rollbacks.
7. **`LEARNING`**: Extracts episodic and procedural insights into persistent memory.
