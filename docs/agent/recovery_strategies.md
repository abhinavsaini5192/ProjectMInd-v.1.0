# Recovery Strategies

The `RecoveryDecisionEngine` uses explicit policy rules to select one of five strategies:

1. **RETRY**: Only used for `ENVIRONMENT_FAILURE` (e.g. transient network timeouts).
2. **REPAIR**: The default for standard coding mistakes (`TYPE`, `BUILD`, `TEST`). It generates a new task plan to fix the specific broken symbols.
3. **ROLLBACK**: Triggered immediately for `CRITICAL` failures, or if the `MAX_RECOVERY_ATTEMPTS` limit is breached.
4. **NO_ACTION**: Triggered if the `PreExistingFailureDetector` proves that the failure existed *before* the agent touched the codebase. We do not autonomously repair unrelated user code.
5. **ESCALATE**: Halts the system entirely and requests human intervention. Used if a Rollback fails or a conflict is detected.
