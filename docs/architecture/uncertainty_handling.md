# Uncertainty Handling

When the system cannot achieve high confidence, the `UncertaintyEngine` tags the `ReasoningState` with specific `UncertaintyType`s.

Examples:
- `TASK_AMBIGUITY`: The task string uses vague words ("it", "the bug", "that file") without naming symbols.
- `MULTIPLE_VALID_PATHS`: Two or more hypotheses score above `0.4` confidence, meaning the system is torn between valid implementations.
- `INSUFFICIENT_EVIDENCE`: The max confidence across all hypotheses is `< 0.5`.

These tags are consumed by the `KnowledgeGapAnalyzer` to pinpoint exactly what fact is missing from the repository graph to break the tie.
