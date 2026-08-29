# Execution Model

## Execution Result
At the end of a run, the system outputs an `ExecutionResult`.
This struct contains aggregates:
- `succeeded` count
- `failed` count
- `blocked` count (due to dependency failures)
- `cancelled` count
- An array of individual `ActionResult`s tracking exactly what files changed.

## Execution States
- **PENDING**: Waiting to run.
- **READY**: Dependencies are satisfied.
- **RUNNING**: Currently executing.
- **SUCCEEDED**: Completed successfully.
- **FAILED**: Threw an `ExecutionError`.
- **BLOCKED**: One of the upstream dependencies `FAILED`.
- **CANCELLED**: The human user or system terminated the run early.
