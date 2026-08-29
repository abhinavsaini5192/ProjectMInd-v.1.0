# Plan Risk Analysis

The `RiskAnalyzer` mathematically determines how dangerous a generated plan is.

## Criteria
Risk is elevated based on:
1. **Blast Radius**: A plan modifying 10+ context entities is automatically `HIGH` risk.
2. **Domain Sentitivity**: If the blast radius intersects with security systems (e.g., Auth, Payments), the risk is bumped (e.g., `HIGH` -> `CRITICAL`).

## Approval Requirements
If a plan yields a `HIGH` or `CRITICAL` risk rating, `approvalRequirement` is set to `true`. This serves as a hard stop for the Agent Runtime to prompt the human developer.
