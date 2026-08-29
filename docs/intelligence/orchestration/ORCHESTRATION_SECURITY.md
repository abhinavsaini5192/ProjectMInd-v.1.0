# Orchestration Security & Safety Boundaries

The orchestrator enforces strict non-bypassable security barriers.

## Architectural Boundaries
1. **No Direct SLM Execution**: SLM output is strictly advisory; deterministic state machines govern all transitions.
2. **Execution Gate Enforcement**: Plans containing `DELETE`, irreversible actions, or high risks cannot bypass `ApprovalGuard`.
3. **Immutable History**: Previous cycle records, reasoning outputs, and feedback snapshots are immutable.
4. **Dry-Run Mode**: `runTask(..., { dryRun: true })` provides complete preview capability without writing to disk or committing memory changes.
