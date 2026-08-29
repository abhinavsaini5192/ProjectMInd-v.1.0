# Brain Decision Model

The sole output of the Brain Engine is a `BrainDecision`.

This is a strictly typed JSON object containing:
- `decisionType` (e.g. `MODIFY_CODE`, `REQUEST_INFORMATION`, `NO_ACTION`)
- `confidence` (The mathematical confidence derived by the system)
- `targets` (Specific files or symbols to affect)
- `actions` (High level intents)

## The Decision Validator
Before a decision is accepted, the `DecisionValidator` intercepts it.
If the SLM outputs `MODIFY_CODE` for `NonExistentService.ts`, the validator checks the Layer 2 graph, detects the hallucination, and immediately rejects the decision, throwing an `INVALID_DECISION` error. The hallucination is never passed down to the execution layer.
