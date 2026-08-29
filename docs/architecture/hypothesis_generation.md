# Hypothesis Generation

Instead of committing to the first plausible interpretation of a developer's task, the `HypothesisEngine` explicitly generates multiple `Hypothesis` objects when ambiguity is detected.

Example:
Task: "Fix the ambiguous feature"
- **Hypothesis 1**: The user means the legacy `AuthService` (Supported by `FEATURE_MATCH` evidence).
- **Hypothesis 2**: The user means the new `OAuthService` (Supported by `RECENT_CHANGE` evidence).

By tracking these separately, the system avoids tunneling into an incorrect assumption. If confidence remains low for all hypotheses, a `ClarificationRequest` is generated.
