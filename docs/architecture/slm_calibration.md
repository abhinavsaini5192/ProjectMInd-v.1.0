# Confidence Calibration

ProjectMind does not trust the raw confidence scores output by SLMs. Models are often notoriously overconfident when hallucinating.

To solve this, ProjectMind uses the `ConfidenceCalibrator`.

## Mechanism
The Calibrator tracks the mathematical relationship between a model's *claimed* confidence and its *actual* historical success rate for a given task. 

If a model frequently claims 90% confidence but only produces correct context 45% of the time, the `ConfidenceCalibrator` applies a `0.5` dampening factor. Future predictions of `0.80` confidence from that model will be mathematically calibrated down to `0.40` before the Decision Engine considers them.

This ensures ProjectMind's uncertainty thresholds remain strictly deterministic and grounded in empirical reality.
