# ProjectMind Phase 5 Intelligence Layer Architecture

## Overview

The Phase 5 Intelligence Layer integrates local Small Language Models (SLMs), structured reasoning, contextual engineering, adaptive task decomposition, action planning, controlled execution, and execution feedback into a hardened, production-grade autonomous agent architecture.

## High-Level System Architecture

```
User Request / API
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                   ProjectMindAgent                       │
│  (Sanitization, Autonomy Gating, Auditing, Metrics)      │
└──────────────────────────┬───────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌────────────────────────┐           ┌────────────────────────┐
│  DecompositionEngine   │           │    TaskOrchestrator    │
│  - Subtask Management  │           │  - Cycle Coordination  │
│  - Info Gap Resolution │           │  - State Machine       │
│  - Budget Sizing       │           │  - Goal Management     │
└────────────────────────┘           └───────────┬────────────┘
                                                 │
                                                 ▼
                                     ┌────────────────────────┐
                                     │        TaskLoop        │
                                     └───────────┬────────────┘
                                                 │
   ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
   ▼                                             ▼                                             ▼
┌────────────────────────┐           ┌────────────────────────┐           ┌────────────────────────┐
│     ContextEngine      │           │StructuredReasoningEngine│          │   PlanningCoordinator  │
│  - Vector Retrieval    │           │  - Strategy Selection  │           │  - ActionPlan Gen      │
│  - Budget Management   │           │  - Output Normalization│           │  - Freshness Validation│
│  - Prompt Synthesis    │           │  - Evidence Grounding  │           │  - Approval Guard      │
└────────────────────────┘           └────────────────────────┘           └───────────┬────────────┘
                                                                                      │
                                                                                      ▼
                                                                          ┌────────────────────────┐
                                                                          │    ExecutionEngine     │
                                                                          │  - Controlled Tools    │
                                                                          │  - Dry Run Guard       │
                                                                          │  - Rollback Support    │
                                                                          └───────────┬────────────┘
                                                                                      │
                                                                                      ▼
                                                                          ┌────────────────────────┐
                                                                          │     FeedbackEngine     │
                                                                          │  - Outcome Analysis    │
                                                                          │  - Continuous Learning │
                                                                          │  - Goal Evaluation     │
                                                                          └────────────────────────┘
```

## Core Subsystems Integration

1. **SLM Runtime (5.1 & 5.2)**: Model discovery, registry, hardware-aware local model selection, fallback execution.
2. **Context Engineering (5.3)**: Token-budgeted context synthesis, prompt injection protection with `<repository-data>` tags, secret redaction.
3. **Structured Reasoning (5.4)**: Domain strategies (bug analysis, architecture, code review), normalized JSON schemas, hypothesis tracking.
4. **Planning & Gating (5.5 & 5.6)**: Action plans with preconditions, postconditions, validation steps, and plan freshness checks.
5. **Execution Feedback (5.7)**: Outcome analysis, change sets, failure categorization, continuous learning loop.
6. **Orchestration & Decomposition (5.8 & 5.9)**: State machine, cycle limits, loop detection, adaptive task decomposition.
7. **Production Hardening (5.10)**: Strict brain boundary, failure taxonomy with deterministic recovery, prompt injection defense, audit trails, and health metrics.
