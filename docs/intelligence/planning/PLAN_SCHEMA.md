# Action Plan Schema

Structured `ActionPlan` entities contain everything required for future approval and execution.

## Fields
- `planId`: Unique identifier (`plan_...`)
- `decisionId`: Parent `Decision` identifier
- `taskId`: Associated user/agent task
- `objective`: High-level goal
- `status`: `DRAFT` | `VALIDATED` | `BLOCKED` | `NEEDS_APPROVAL` | `APPROVED` | `EXECUTING` | `COMPLETED` | `FAILED` | `CANCELLED` | `STALE` | `INVALIDATED`
- `steps`: Array of `ActionStep` nodes (order, type, description, target, dependencies, preconditions, expectedOutcome, riskLevel, reversibility)
- `dependencies`: Directed dependency edges (`HARD` | `SOFT`)
- `preconditions`: Testable pre-execution requirements (`SYMBOL_EXISTS`, `FILE_EXISTS`, `TESTS_PASS`)
- `postconditions`: Expected post-execution assertions
- `risks`: Categorized risk assessments
- `validationPlan`: Verification test suites and typecheck flags
- `knowledgeVersion`: Repository graph version at time of plan generation
- `reasoningId`: Grounding `ReasoningResult` trace
