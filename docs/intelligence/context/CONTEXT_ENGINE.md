# Context Engine

The `ContextEngine` is the top-level orchestrator in ProjectMind for assembling relevant, bounded, high-value context for a given task.

## Architectural Data Flow

```
User Request
      ↓
Brain / Task Understanding
      ↓
ContextPlanner (produces ContextPlan)
      ↓
ContextRetrievers (Knowledge, Memory, Dependency, Feature, Change)
      ↓
ContextDeduplicator (merges duplicates, identifies conflicts)
      ↓
ContextScorer & RelevanceRanker (scores explicit mentions, dependency proximity, trust)
      ↓
ContextBudgetManager (reserves output/system tokens, truncates low priority items)
      ↓
ContextPackage (structured sections with provenance)
      ↓
PromptBuilder (produces SLMRequest with prompt trace)
```

## Core Invariant
Neither the `ContextEngine` nor `PromptBuilder` scans the raw repository filesystem or accesses raw databases directly. They operate purely across structured ProjectMind knowledge adapters.
