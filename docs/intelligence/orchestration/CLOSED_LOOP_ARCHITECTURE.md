# Closed-Loop System Architecture

ProjectMind's Autonomous Agent Loop establishes a fully grounded, self-correcting closed-loop system connecting cognitive intelligence with execution, verification, and persistent memory.

## Architecture

```
User Intent / Task
        ↓
AutonomousAgentLoop (Phase 5.6)
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Brain Session State Management (Phase 4.10)              │
│ 2. Context Retrieval & Token Budgeting (Phase 5.3)          │
│ 3. Model Selection & Local Inference (Phase 5.1 & 5.2)      │
│ 4. Structured Reasoning & Evidence Grounding (Phase 5.4)    │
│ 5. Decision Gating & Action Planning (Phase 5.5)            │
│ 6. Plan Validation & Staleness Check (Phase 5.5)            │
│ 7. Execution Gate & Policy Security (Phase 4.4)             │
│ 8. Safe Code Modification & Execution (Phase 4.5 & 4.6)     │
│ 9. Multi-Tier Verification (Phase 4.7)                      │
│ 10. Recovery & Rollback Coordinator (Phase 4.8)             │
│ 11. Memory Extraction & Closed-Loop Feedback (Phase 4.9)    │
└─────────────────────────────────────────────────────────────┘
        ↓
Final Execution Outcome & Auditable Trace
```

## Architectural Invariants
1. **Zero Direct Model Execution**: All model output is filtered through Structured Reasoning, Plan Validation, and Security Gates before execution.
2. **Approval Gating**: High-risk actions (`DELETE`, irreversible mutations) automatically pause the loop in `AWAITING_APPROVAL`.
3. **Bounded Iteration**: Strict iteration budgets prevent infinite reasoning or repair cycles.
4. **Continuous Learning**: Execution and verification outcomes are stored as episodic memories in `AgentMemory`.
