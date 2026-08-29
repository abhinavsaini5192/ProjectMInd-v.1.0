# Knowledge Health

The overall Health of the repository knowledge is quantified as a float from `0.0` to `1.0`.

The `HealthCalculator` penalizes this score:
- `-0.5` for CRITICAL issues
- `-0.1` for ERROR issues
- `-0.02` for WARNING issues

If the score dips below 0.5, or any CRITICAL issue exists, the status transitions to `CRITICAL`.
