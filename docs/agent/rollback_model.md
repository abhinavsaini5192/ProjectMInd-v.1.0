# Rollback Model

If the `RecoveryDecisionEngine` selects the `ROLLBACK` strategy, it invokes the capabilities built in Phase 4.6.

## Conflict Protection
Before rolling back, the engine checks the current file hash against the `afterHash` stored in the `RecoverySnapshot`. 
If they differ, it means the user (or another process) manually edited the file *while* the agent was attempting recovery.
The engine throws a `ROLLBACK_CONFLICT` and transitions to the `ESCALATE` strategy. It will **never** overwrite newer human edits to restore its old snapshot.
