# Context Package

The final output of the ProjectMind Brain is the `ContextPackage`.

It is a structured payload designed to be passed directly into an AI coding agent's prompt (e.g., Cursor, Claude, or a custom script).

## Budgeting
The `ContextBudgetManager` enforces strict limits to ensure the AI agent isn't overwhelmed. If `MAX_FILES` or `MAX_TOKENS` is exceeded, the lowest-scoring entities from the `DecisionFusionEngine` are automatically trimmed. 

The remaining entities are classified as `primaryContext` (score $\ge$ 0.8) and `secondaryContext` (score < 0.8).
