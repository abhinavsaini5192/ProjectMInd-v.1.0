# Information Gaps & Uncertainty Resolution

An `InformationGap` represents missing information required to reason about a subtask safely.

## Resolution Loop
1. `ContextRequirementAnalyzer` detects missing definitions or unlocated configuration.
2. `InformationGap` is created and marked as `blocking: true` or `false`.
3. `ContextQueryPlanner` generates priority-1 targeted queries to resolve the gap.
4. Query results resolve the gap, unblocking subtask reasoning.
