# Intelligent Context Selection

The `ContextSelector` deterministic engine retrieves, scores, and packs relevant context for the current subtask without relying on full repository dumps.

## Information Flow
```
Subtask Requirements
       ↓
ContextQueryPlanner
       ↓
Knowledge / Memory / Workspace
       ↓
RelevanceScorer (Multi-Factor Ranking)
       ↓
ContextBudgetGuard (Token Limits & Prioritization)
       ↓
ContextSelection (Supplied to Brain / SLM)
```
