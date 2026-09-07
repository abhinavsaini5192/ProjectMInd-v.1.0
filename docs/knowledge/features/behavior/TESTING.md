# Testing & Verification

## Overview

The Feature Behavior & Flow Analysis Engine is verified by 14 comprehensive test suites covering unit logic, integration pipelines, security sanitization, and architectural boundaries.

---

## Test Suites Index

| Test Suite | Description |
| :--- | :--- |
| `modelsAndTypes.test.ts` | Validates 18 step types, 12 flow types, 13 relation types, confidence calibration, and model constructors. |
| `authenticationFlow.test.ts` | Reconstructs complete multi-tier authentication flow (Route $\to$ Controller $\to$ Service $\to$ DB $\to$ Token $\to$ Response). |
| `paymentFlow.test.ts` | Tests third-party SDK (`EXTERNAL_SERVICE`) integration and database persistence in payment flow. |
| `eventFlow.test.ts` | Validates asynchronous boundaries (`asynchronous: true`) on event emitters, message queues, and workers. |
| `controlFlow.test.ts` | Tests conditional branching (`CONDITION` nodes) with `true` and `false` paths. |
| `dataFlow.test.ts` | Tests data transformation pipelines and verifies secret redaction across DTOs. |
| `crossFeatureFlow.test.ts` | Validates boundary detection across multiple features (`Checkout` $\to$ `Payment` $\to$ `Auth`). |
| `multiFlow.test.ts` | Tests multiple distinct flows coexisting under one feature (Login, OAuth, Refresh, Logout). |
| `conflict.test.ts` | Tests contradictory path detection (`FeatureBehaviorConflict`), confidence penalty, and resolution. |
| `incremental.test.ts` | Verifies dirty resource tracking re-evaluates only affected features and leaves others untouched. |
| `staleFlow.test.ts` | Tests behavior version incrementing ($1 \to 2$) and lifecycle flow replacement in repository. |
| `documentationInjection.test.ts` | Tests defense against prompt injections in documentation and metadata. |
| `security.test.ts` | Verifies secret redaction (JWT, AWS keys, passwords) and referential integrity error handling. |
| `architecturalBoundaries.test.ts` | Tests DIContainer registration, singletons, and explainability Markdown generation. |

---

## Running Tests

```bash
# Run Phase 6.5 test suites only
npx vitest run tests/knowledge/features/behavior/

# Run full project regression suite (470+ tests)
npx vitest run
```
