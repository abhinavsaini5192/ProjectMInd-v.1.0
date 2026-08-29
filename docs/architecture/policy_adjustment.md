# Policy Adjustment

The Brain does not use a black-box neural net for its core operations, meaning it learns deterministically through Policy Adjustment.

If the `ContextEvaluator` flags that a specific type of feature (e.g., Database Migrations) is consistently flagged as `MISSING_CONTEXT` for `BUG_FIX` intents, the `PolicyAdjustmentEngine` can automatically increment the relevance weight for that entity type.

Policies are:
- Explicit and versioned.
- Deterministic and auditable.
- Never directly modify source code.
