# Verification Confidence

The `VerificationConfidence` module mathematically derives a deterministic confidence score (`HIGH`, `MEDIUM`, `LOW`, `NONE`).

- A run with no checks yields `NONE`.
- A run where **any** check returns `FAIL` immediately hard-caps confidence at `LOW`.
- A perfect run across heavy-weight checks (like `TYPE`, `SYNTAX`, `TEST`) yields `HIGH`.
- Skipped checks yield 0 points, passively dragging down the final percentage (preventing false `HIGH` confidence on poorly-tested code).

The SLM is explicitly forbidden from generating or hallucinating this confidence score.
