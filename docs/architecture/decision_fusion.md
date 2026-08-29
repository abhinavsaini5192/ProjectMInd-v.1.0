# Decision Fusion

The `DecisionFusionEngine` calculates the final confidence score for any repository entity being considered for the `ContextPackage`.

## Fusion Formula
```
FinalScore = (DetScore * DetWeight) + (SLMScore * SLMWeight * CalibrationFactor)
```

## Weighting Policies
The `TaskWeightingPolicy` assigns different weights depending on the task.
- **Security tasks**: `DetWeight = 1.0`, `SLMWeight = 0.0`. The SLM is completely ignored to prevent prompt-injection attacks.
- **Feature Interpretation**: `DetWeight = 0.4`, `SLMWeight = 0.6`. The SLM's semantic abilities are leveraged heavily.

This produces an auditable `FinalDecision` record that explicitly shows how much the SLM influenced the final output.
