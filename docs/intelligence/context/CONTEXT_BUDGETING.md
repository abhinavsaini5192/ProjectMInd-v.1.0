# Context Budgeting

Context budgeting ensures that prompt payloads strictly fit within the target SLM's physical context window.

## Token Reservations
For a model with context window $C$:
- **Output Token Reservation**: Reserved capacity for generated decision (e.g. 2048 tokens)
- **System Prompt Reservation**: Space for system instructions and JSON schemas (e.g. 1000 tokens)
- **Task Prompt Reservation**: Space for user objective and constraints (e.g. 500 tokens)
- **Safety Margin**: Safety buffer for token estimation inaccuracies (e.g. 200 tokens)

$$\text{AvailableContextBudget} = C - (\text{Output} + \text{System} + \text{Task} + \text{SafetyMargin})$$

## Priority-Aware Truncation
When the retrieved context exceeds `AvailableContextBudget`, the `ContextBudgetManager` discards lowest-priority items first (Priority 5, then 4, etc.), ensuring Priority 1 items (explicitly requested symbols and direct dependencies) are preserved.
