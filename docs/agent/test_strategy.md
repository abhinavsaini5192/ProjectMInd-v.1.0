# Test & Build Strategy

ProjectMind does not hardcode `npm test` or `tsc`.

Instead, the `TestRunner`, `TypeCheckRunner`, and `BuildRunner` rely on project-level configurations detected by Layer 2, translating those capabilities into execution requests sent securely through the Phase 4.5 Execution Engine.

## Targeted Execution
The `VerificationPlanner` avoids running full-suite integration tests for a single-line typo fix. It attempts to find targeted unit tests nearest to the modified symbol first.
