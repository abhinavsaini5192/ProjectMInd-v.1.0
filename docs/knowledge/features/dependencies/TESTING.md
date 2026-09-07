# Testing Strategy & Test Suites

## Test Coverage Summary

Phase 6.4 includes **21 dedicated test suites** in `tests/knowledge/features/dependencies/` with **45 unit and integration tests**:

| Test Suite | Purpose | Tests |
|---|---|---|
| `modelsAndTypes.test.ts` | Validates all 18 types, confidence levels, model contracts, candidate transitions | 5 |
| `featureDependencyGraph.test.ts` | Graph data structure, forward/reverse maps, BFS pathfinding, chains, cycles | 7 |
| `codeDependencySource.test.ts` | Code imports/calls, library filtering (`lodash`, `react`, `fs`, etc.) | 2 |
| `sharedResourceSource.test.ts` | Multi-feature asset sharing $\to$ `SHARES_RESOURCE` (not `DEPENDS_ON`) | 1 |
| `endpointInteractionSource.test.ts` | Middleware security protection and cross-feature API endpoint callers | 2 |
| `dataDependencySource.test.ts` | Database entity foreign keys $\to$ `USES` and shared models $\to$ `SHARES_DATA` | 2 |
| `configurationDependencySource.test.ts` | Cross-feature configuration settings with secret redaction | 1 |
| `moduleDependencySource.test.ts` | Module containment and cross-module imports | 1 |
| `integrationDependencySource.test.ts` | Pub/Sub event publishers (`TRIGGERS`) and subscribers (`CONSUMES`) | 1 |
| `architectureDependencySource.test.ts` | Layer hierarchy (`PROVIDES` from platform to application) | 1 |
| `testRelationshipSource.test.ts` | Integration tests producing `VERIFIES` as supporting evidence only | 1 |
| `historyRelationshipSource.test.ts` | Git commit co-changes $\to$ `ASSOCIATED_WITH` with `LOW` confidence | 1 |
| `scoringAndResolution.test.ts` | Multi-source weighted scoring, diversity bonus (+0.10), role priority | 5 |
| `cycleDetection.test.ts` | 3-node cyclic loops, classification, and non-destructive graph preservation | 3 |
| `selfDependency.test.ts` | Strict validator rejection of self-dependencies ($A \to A$) | 2 |
| `manualRelationshipProtection.test.ts` | Immutability and immunity of user-curated manual relationships | 2 |
| `incrementalUpdates.test.ts` | Selective re-evaluation of affected features on resource change | 1 |
| `staleRelationships.test.ts` | Clean deactivation and graph edge removal when connections break | 1 |
| `dependencyExplainer.test.ts` | Structured reasoning, evidence breakdown, risk factors, narrative | 2 |
| `securityAndUntrustedInput.test.ts` | Null/corrupted input tolerance, path traversal safety | 2 |
| `architecturalBoundaries.test.ts` | Cross-repository boundary enforcement and DIContainer service registration | 2 |

---

## Verification Commands

- Run Phase 6.4 test suite:
  ```bash
  npx vitest run tests/knowledge/features/dependencies/
  ```
- Run entire project test suite:
  ```bash
  npx vitest run
  ```
- Verify TypeScript types:
  ```bash
  npx tsc --noEmit
  ```
