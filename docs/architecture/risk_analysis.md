# Risk Analysis

The `RiskAnalyzer` mathematically calculates the danger of a proposed code change before the agent is allowed to write it.

It looks at:
- **Coupling**: The number of downstream features affected by the target.
- **Volatility**: The domain sensitivity (e.g. modifications to core Authentication or Payments).

Changes are classified into `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` risk levels, along with deterministic evidence tracing exactly why that score was assigned.
