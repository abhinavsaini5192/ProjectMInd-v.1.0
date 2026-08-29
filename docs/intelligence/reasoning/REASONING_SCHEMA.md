# Reasoning Schema

Reasoning outputs are strictly structured according to the `ReasoningResult` schema.

## Schema Components

- `reasoningId`: Unique reasoning execution identifier (`rsn_...`)
- `taskId`: Associated task identifier
- `modelId`: SLM identifier that performed the inference
- `contextPackageId`: Identifier of the grounding `ContextPackage`
- `observations`: Inspectable facts and observations extracted from context
- `evidence`: Grounded claims linked to valid `sourceId` references
- `hypotheses`: Competing potential explanations with confidence ratings
- `conclusions`: Inferences with assumptions, uncertainty, and supporting evidence IDs
- `assumptions`: Explicitly stated non-verified assumptions
- `alternatives`: Competing alternative solutions or hypotheses
- `uncertainty`: Structured uncertainty items (`UNKNOWN`, `LOW_CONFIDENCE`, `INSUFFICIENT_EVIDENCE`, `CONFLICTING_EVIDENCE`, `AMBIGUOUS_REQUEST`)
- `recommendations`: Actionable suggestions for the agent runtime
- `decision`:
  - `status`: `READY_FOR_EXECUTION` | `NEEDS_MORE_INFORMATION` | `PROPOSED_CHANGE` | `RECOMMENDATION` | `NO_DECISION`
  - `targets`: Modified symbol or file targets
  - `actions`: Proposed actions
  - `constraints`: Invariants to preserve
  - `requiredVerification`: Validation steps
- `confidence`: Calibrated score (0.0 to 1.0)
- `validationStatus`: `VALID` | `PARTIALLY_VALID` | `INVALID`
- `schemaVersion`: `"1.0"`
- `strategyVersion`: `"1.0"`
