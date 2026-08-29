# Decision Engine

The `DecisionEngine` evaluates structured `ReasoningResult` artifacts produced by Phase 5.4, applies decision gates, computes weighted decision factors, and produces a formal `Decision`.

## Decision Gating Workflow

```
ReasoningResult
      ↓
Evidence & Uncertainty Analysis
      ↓
[Gate: Sufficient Evidence & Confidence?]
    ├── NO  → Type = NEEDS_INFORMATION (Triggers InvestigationPlan)
    └── YES → [Gate: Risk Assessment]
                 ├── High Risk / Delete / Cross-module → Type = DELETE / CONFIGURE (NEEDS_APPROVAL)
                 └── Standard Defect / Feature        → Type = MODIFY / CREATE / REFACTOR
```

## Decision Factors
- `EVIDENCE_STRENGTH`: Number and trust level of grounded knowledge references.
- `CONFIDENCE`: Model and validator calibrated confidence score ($0.0 \dots 1.0$).
- `UNCERTAINTY`: Categorized uncertainty ratings (`INSUFFICIENT_EVIDENCE`, `CONFLICTING_EVIDENCE`, `AMBIGUOUS_REQUEST`).
- `RISK`: Potential impact on repository stability.
