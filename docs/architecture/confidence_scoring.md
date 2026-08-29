# Confidence Scoring

ProjectMind calculates confidence mathematically rather than relying on LLM/SLM self-reported certainty.

The `ConfidenceEngine` aggregates weights from structured `Evidence` objects.

Examples of configured weights:
- Explicitly mentioning a feature by name in the task: `+0.4`
- Context Planner identifying a feature as required: `+0.3`
- Evidence derived from a stale L2 Snapshot: `-0.2`

Thresholds:
- `>= 0.90`: `HIGH_CONFIDENCE`
- `>= 0.70`: `MODERATE_CONFIDENCE`
- `>= 0.50`: `LOW_CONFIDENCE`
- `< 0.50`: `INSUFFICIENT_CONFIDENCE` (Triggers Clarification)
