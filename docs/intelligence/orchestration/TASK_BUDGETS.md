# Task Budgets & Constraints

Deterministic budget bounds prevent runaway execution loops or resource exhaustion.

## Budget Limits (`TaskBudget`)
- `maxCycles`: Maximum cognitive/execution iterations (Default: 5).
- `maxExecutionTimeMs`: Total allowed elapsed duration (Default: 120,000ms).
- `maxExecutionSteps`: Hard limit on individual tool actions.
- `maxFilesChanged`: Upper limit on modified repository files.
- `maxRetries`: Maximum transient retry attempts.
- `maxReplans`: Maximum plan revisions allowed per task.
- `maxSLMCalls`: Token and inference call caps.
