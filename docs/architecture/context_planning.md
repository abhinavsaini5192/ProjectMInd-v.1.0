# Context Planning & Budgeting

The primary goal of the Context Planner is to prevent Context Window overflow and hallucination in downstream AI models.

## Categorization
Every piece of knowledge (`ContextItem`) retrieved from the Knowledge API is categorized:
- **REQUIRED**: Must be included (e.g., target feature definitions).
- **USEFUL**: Highly recommended (e.g., direct dependencies).
- **OPTIONAL**: Included only if budget permits.
- **EXCLUDED**: Explicitly stripped due to Security Policies (e.g., secrets, credentials).

## Budgeting
The `ContextBudgetOptimizer` iterates over the ranked context list and trims it down to the exact `maxTokens` limit, throwing out lower-ranked OPTIONAL or USEFUL context to guarantee that REQUIRED items always fit.
