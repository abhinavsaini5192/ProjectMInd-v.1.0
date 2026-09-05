# Testing Strategy & Test Suites

## Overview

The Feature-to-Code Mapping Engine is covered by **19 specialized test suites** located in `tests/knowledge/features/mapping/`:

---

## Test Suites Summary

| Test File | Test Cases | Scope Verified |
|---|---|---|
| `modelsAndTypes.test.ts` | 4 | Canonical models, helper functions, confidence score mapping |
| `fileMappingSource.test.ts` | 1 | File mapping, path matching, negative utility filtering |
| `symbolMappingSource.test.ts` | 2 | Class/function mapping, role inference (`API`, `IMPLEMENTATION`, `STORAGE`, `CONFIGURATION`) |
| `moduleMappingSource.test.ts` | 2 | Module container mapping, export alignment, `module != feature` multi-mapping |
| `endpointMappingSource.test.ts` | 2 | API route mapping, `VERY_HIGH` confidence, `ENTRY_POINT` role, metadata |
| `dependencyMappingSource.test.ts` | 2 | External package dependencies, filtering generic libraries (`lodash`, `chalk`) |
| `configurationMappingSource.test.ts` | 1 | Config keys, secret value protection & non-leakage |
| `databaseMappingSource.test.ts` | 1 | Entity & repository persistence, shared multi-feature entities |
| `testMappingSource.test.ts` | 2 | Test suite verification mapping (`TEST`, `VERIFICATION`) |
| `uiAndCommandMappingSource.test.ts` | 2 | UI components (`UI`) and CLI commands (`COMMAND`) |
| `documentationMappingSource.test.ts` | 1 | Untrusted markdown sections, prompt injection neutralization |
| `scoringAndResolution.test.ts` | 3 | Weighted scoring, cross-source diversity bonus, dominant role resolution |
| `sharedResource.test.ts` | 1 | `UserRepository` shared between `Authentication` and `User Management`, bidirectional lookup |
| `weakAndStrongSignal.test.ts` | 1 | Strong signal promotion (`VERY_HIGH`) vs weak/generic utility exclusion |
| `incrementalMapping.test.ts` | 1 | Re-evaluating only affected features, preserving untouched features |
| `manualMappingProtection.test.ts` | 1 | Preserving `MANUAL` mapping role, scope, ID, and provenance |
| `staleMappingDeactivation.test.ts` | 1 | Soft-deactivating disappeared resources, preserving audit history |
| `reverseLookupAndExplainer.test.ts` | 1 | Bidirectional reverse lookup & structured explainability |
| `architecturalBoundaries.test.ts` | 2 | DI registration, EventBus lifecycle events, zero duplicate scanners |

**Total**: 19 Test Files, 31 Unit & Integration Tests.

---

## Verification Commands

### Run Only Mapping Tests
```bash
npx vitest run tests/knowledge/features/mapping/
```

### Run Full Repository Suite (405 Tests)
```bash
npx vitest run
```

### Check TypeScript Compilation
```bash
npx tsc --noEmit
```
