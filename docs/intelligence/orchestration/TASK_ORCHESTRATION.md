# Autonomous Task Orchestration Architecture

The Task Orchestrator (`src/intelligence/orchestration/core/TaskOrchestrator.ts`) coordinates multi-cycle iterative task solving across the cognitive, execution, and feedback layers.

## High-Level Flow
```
User Task Request
       ↓
TaskOrchestrator
       ↓
┌────────────────────────────────────────────────────────┐
│ 1. State Machine Transition & Validation               │
│ 2. Context Gathering (Incremental & Targeted)          │
│ 3. Structured Reasoning & Evidence Cross-Checks        │
│ 4. Action Planning & DAG Construction                  │
│ 5. Approval & Policy Guard Evaluation                  │
│ 6. Execution Gate & Tool Invocation                    │
│ 7. Verification & Multi-Tier Testing                   │
│ 8. Feedback Analysis & Goal Evaluation                 │
│ 9. Replanning / Interactive User Clarification         │
└────────────────────────────────────────────────────────┘
       ↓
Task Outcome & Auditable History
```
