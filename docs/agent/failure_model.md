# Failure Classification Model

The `FailureClassifier` deterministically converts raw verification results into a typed `FailureCategory` and a `FailureSeverity`.

## Severities
1. **INFO**: Task outcome was successful, or failure is irrelevant.
2. **WARNING**: A non-blocking failure (e.g., a flaky test).
3. **ERROR**: A standard deterministic breakage (e.g., Build failed, Typecheck failed).
4. **CRITICAL**: An unrecoverable or highly dangerous state (e.g., Syntax corruption, Security policy violation).

CRITICAL failures immediately bypass the `REPAIR` flow and trigger a `ROLLBACK`.
