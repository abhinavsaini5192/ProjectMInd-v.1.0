# Execution Failures

The `FailureType` enum explicitly categorizes execution crashes so the system can recover.

## Types
- `PRECONDITION_FAILED`
- `PERMISSION_DENIED`
- `TARGET_NOT_FOUND`
- `CONFLICT` (optimistic concurrency violation)
- `TIMEOUT`
- `PROCESS_FAILED`
- `PATH_TRAVERSAL`
- `INTERNAL_ERROR`
- `CANCELLED`

## Cascading Failures
If Action A is a dependency of Action B, and Action A yields one of the above `FailureType`s, the `ExecutionScheduler` automatically transitions Action B to `BLOCKED`. It is never executed.
