# Feedback Pipeline & Flow

The deterministic execution feedback pipeline:

```
ExecutionCompleted (Phase 5.6)
       ↓
ExecutionObserver (Gathers changed files, tests, errors)
       ↓
ChangeAnalyzer (Categorizes files, symbols, deps, architecture)
       ↓
OutcomeAnalyzer (Evaluates goal achievement vs execution status)
       ↓
GoalEvaluator & Failure/Success Analyzers (Root-cause classification)
       ↓
LearningCandidateBuilder (Constructs evidence-grounded candidates)
       ↓
LearningValidator & Deduplicator (Filters weak/duplicate items)
       ↓
LearningPromoter (Evaluates multi-tier promotion)
       ↓
Adapters (MemoryEngine, KnowledgeGraph, Context Invalidation, Brain)
```
