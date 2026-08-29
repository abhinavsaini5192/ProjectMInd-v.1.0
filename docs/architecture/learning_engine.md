# Learning Engine

The Learning Engine (Layer 3.4) tracks what happens *after* ProjectMind makes a decision.
Instead of assuming every context plan it generates is perfect, it observes the downstream AI Agent's execution to evaluate outcome success, regressions, and context utility.

## Flow
1. **Agent Session**: Tracks multi-attempt execution by Claude, Cursor, or humans. Records modified files and test results.
2. **Outcome Analysis**: Maps the execution to `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`, `ABANDONED`.
3. **Context Evaluation**: Determines what provided context was actually `USEFUL` versus `MISLEADING`, and what was `MISSING`.
4. **Scoring**: Calculates deterministic `DecisionQualityScore` and `ContextUtilityScore`.
5. **Policy Adjustment**: Updates future context weights if certain patterns emerge (e.g., repeatedly missing tests).
6. **Dataset Prep**: Selects high-quality records, sanitizes them, and builds SLM training examples.
