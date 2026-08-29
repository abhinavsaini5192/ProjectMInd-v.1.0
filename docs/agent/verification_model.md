# Verification Model

A `VerificationResult` aggregates the status of several individual `CheckResult`s.

## Fields
- **`overallStatus`**: `VERIFIED`, `PARTIALLY_VERIFIED`, `FAILED`, `UNVERIFIED`.
- **`confidence`**: Mathematical confidence score (`HIGH`, `MEDIUM`, `LOW`, `NONE`).
- **`missingChanges`**: Expected files that were untouched.
- **`unexpectedChanges`**: Files that were unexpectedly mutated.
- **`evidence`**: Hard proof (e.g. `SyntaxError at line 10`) preventing vague "it failed" messages.
