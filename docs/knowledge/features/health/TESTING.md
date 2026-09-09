# Testing Strategy & Test Suites

## 1. Test Coverage Overview

Phase 6.6 includes 12 comprehensive test suites with 49 tests under `tests/knowledge/features/health/`:

1. `modelsAndTypes.test.ts`: Validates all enum types, type guards, and custom error classes.
2. `signals.test.ts`: Validates all 12 health signal providers.
3. `riskDetectors.test.ts`: Validates all 11 risk detectors and risk deduplication.
4. `scoringAndDimensions.test.ts`: Validates 10-dimension scoring, weighting, and health status mapping.
5. `criticalityAndStability.test.ts`: Validates architectural centrality and change churn calculations.
6. `verificationQuality.test.ts`: Validates test resource ratios and flow verification scoring.
7. `conflictAndStaleness.test.ts`: Validates conflicting evidence and cache invalidation.
8. `explainability.test.ts`: Validates Markdown generation and secret redaction.
9. `securityAndSanitization.test.ts`: Validates secret token detection and prompt injection defenses.
10. `architecturalBoundaries.test.ts`: Validates read-only invariant and scoring determinism.
11. `incrementalHealth.test.ts`: Validates incremental neighbor propagation.
12. `syntheticCases.test.ts`: Tests all 10 mandatory synthetic scenarios from Section 50 of the prompt.

---

## 2. Running Health Tests

```bash
# Run Phase 6.6 test suites
npx vitest run tests/knowledge/features/health/

# Run complete repository test suite
npx vitest run
```
