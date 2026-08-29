# Explainability

Every decision made by the ProjectMind Brain is 100% explainable.

The `DecisionExplainer` generates a list of human-readable (and agent-readable) reasons for its actions:
- Why an intent was selected (and with what confidence).
- Why specific features were targeted.
- Why a specific risk score was calculated.
- Why certain context was included, and more importantly, why certain context was excluded (e.g., security stripping).

This deterministic reasoning trace is critical for the `DecisionFeedback` loop which will eventually train the SLM.
