# Relationship Scoring & Confidence Calibration

## Scoring Architecture

`FeatureRelationshipScorer` uses a multi-tiered calibration formula:

1. **Source Weights**:
   - `ENDPOINT`: 0.25 (API route & security middleware contracts)
   - `CODE_DEPENDENCY`: 0.20 (Direct symbol & import calls)
   - `INTEGRATION`: 0.15 (Event publishing and message queues)
   - `ARCHITECTURE`: 0.12 (Platform vs application layering)
   - `DATA`: 0.10 (Database entity foreign keys & readers)
   - `MODULE`: 0.08 (Package & module boundaries)
   - `SHARED_RESOURCE`: 0.05 (Shared technical files)
   - `CONFIGURATION`: 0.04 (Configuration settings)
   - `TEST`: 0.03 (Integration test suites)
   - `HISTORY`: 0.02 (Git co-change correlation)

2. **Single-Source Baseline Preservation**:
   Authoritative signals are preserved even in isolation:
   $$\text{rawScore} = \max(\text{weightedSum}, \max_{e \in \text{evidence}}(e.\text{confidence}))$$
   *(e.g., an endpoint route security middleware with confidence 0.95 will retain 0.95 baseline)*.

3. **Source Diversity Bonus**:
   When candidate evidence is corroborated across $\ge 2$ independent signal sources:
   $$\text{score} = \min(1.0, \text{rawScore} + 0.10)$$

---

## Confidence Level Thresholds

| Score Range | Level | Interpretation |
|---|---|---|
| $[0.90, 1.00]$ | `VERY_HIGH` | Direct API route contract or explicit code import |
| $[0.70, 0.89]$ | `HIGH` | Verified database relation or architectural dependency |
| $[0.45, 0.69]$ | `MEDIUM` | Configuration integration or module coordination |
| $[0.20, 0.44]$ | `LOW` | Circumstantial Git history co-change or weak coupling |
| $[0.00, 0.19]$ | `VERY_LOW` | Noise or uncorroborated hint |
