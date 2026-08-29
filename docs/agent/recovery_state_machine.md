# Recovery State Machine

The Recovery Engine manages attempts using explicit, strictly typed states rather than a web of boolean flags.

### Flow
1. `ANALYZING`: Classifying the failure and checking for pre-existing regressions.
2. `RECOVERY_SELECTED`: A strategy plan is built.
3. `RECOVERING` / `ROLLING_BACK`: The strategy is executing.
4. `VERIFYING`: The strategy's output is being verified.
5. `SUCCESS`: Recovery stabilized the codebase.
6. `ROLLED_BACK`: Codebase reverted safely.
7. `ESCALATED`: Human intervention required.
8. `ABORTED`: Safely ignored (e.g., pre-existing failure).
