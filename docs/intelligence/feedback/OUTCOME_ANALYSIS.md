# Outcome Analysis & Goal Evaluation

The `OutcomeAnalyzer` and `GoalEvaluator` distinguish between command execution success and true task objective success.

## Key Principles
- **Execution Success != Objective Success**: A tool command exiting with code 0 does not imply that an underlying defect is resolved or an architectural requirement is satisfied.
- **Goal Statuses**:
  - `ACHIEVED`: All planned steps executed cleanly and all verification/test suites passed.
  - `PARTIALLY_ACHIEVED`: Execution completed, but some assertions or verifications failed.
  - `NOT_ACHIEVED`: Execution was aborted or encountered fatal errors.
  - `UNKNOWN`: Insufficient evidence to verify the state of the repository.
