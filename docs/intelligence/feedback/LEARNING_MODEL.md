# Learning Model & Promotion Lifecycle

Learning candidates represent actionable insights extracted from task execution.

## Promotion Lifecycle
```
Observation (Confidence < 0.5)
      ↓
Candidate (0.5 <= Confidence < 0.7)
      ↓
Confirmed (0.7 <= Confidence < 0.85)
      ↓
Promoted (Confidence >= 0.85 & Valid Evidence)
```

## Categories & Temporal Types
- **Categories**: `PROJECT_CONVENTION`, `ARCHITECTURAL_FACT`, `DEPENDENCY_FACT`, `FAILURE_PATTERN`, `SUCCESS_PATTERN`, `USER_PREFERENCE`, `WORKFLOW_PATTERN`.
- **Temporal Types**:
  - `PERSISTENT`: Durable repository knowledge stored in long-term memory.
  - `TEMPORARY`: Session-scoped context that is discarded after task completion.
  - `EXPIRING`: Time-bounded observations with explicit TTL expiration.
