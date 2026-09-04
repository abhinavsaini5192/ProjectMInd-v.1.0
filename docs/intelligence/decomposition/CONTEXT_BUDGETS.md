# Context Budgets & Token Management

The `ContextBudgetGuard` ensures reasoning context never overflows model token windows.

## Budget Allocation
- `maxTokens`: Hard ceiling (e.g. 8,000 tokens).
- `reservedTokens`: System prompt and output buffer tokens.
- `usedTokens`: Consumed token count.
- `remainingTokens`: Available token headroom.

## Prioritization & Compression
When token limits are reached, low-relevance candidates are excluded with detailed reasons in `excludedCandidates`.
