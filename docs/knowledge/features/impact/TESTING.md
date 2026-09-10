# Impact Engine Testing Guide

## 1. Test Architecture

The Feature Change Impact Engine is thoroughly verified by 11 test suites covering 47 automated test cases in `tests/knowledge/features/impact/`.

```
tests/knowledge/features/impact/
├── architecturalBoundaries.test.ts   (System boundaries & invariants)
├── boundariesAndSecurity.test.ts      (Prompt injection, test vs. doc guards, secrets)
├── conflictsAndStaleness.test.ts      (Conflicting sources, cache invalidation)
├── explainability.test.ts             (Markdown reports, path breadcrumbs)
├── incrementalImpact.test.ts          (Delta computation & reverse subgraphs)
├── modelsAndTypes.test.ts             (Data models, defaults, and enums)
├── normalization.test.ts              (Target resolution & type precedence)
├── propagationAndCycles.test.ts       (Multi-hop traversal & cycle protection)
├── scoringAndPrioritization.test.ts   (0-100 formula, distance decay, weights)
├── sources.test.ts                    (All 11 impact source providers)
└── syntheticCases.test.ts             (15 canonical end-to-end benchmark scenarios)
```

---

## 2. 15 Synthetic End-to-End Scenarios

The engine is validated against 15 required synthetic scenarios:

1. **Direct Authentication Change**: `AuthService.login()` directly affects Authentication.
2. **Downstream Feature Propagation**: `AuthService.login()` affects Auth directly, Checkout indirectly.
3. **Multi-Hop Impact Chain**: `Auth` -> `Checkout` -> `Order Processing`.
4. **Payment Chain**: `Checkout` -> `Payment Processing` -> `External Payment Provider`.
5. **API Contract Change**: `POST /login` route modification affects Auth directly, callers indirectly with type `API`.
6. **Database Schema Change**: `User` table change affects features using User entity with type `DATA`.
7. **Test Impact Isolation**: Modifying `AuthService.test.ts` records `VERIFICATION` impact only, not implementation impact.
8. **Documentation Change Isolation**: Modifying `README.md` produces no functional implementation impact.
9. **Cycle Termination**: Graph with $A \to B \to C \to A$ terminates safely with cycle detection.
10. **Weak Relationship Discrimination**: Weak naming similarity without dependency does not manufacture impact.
11. **Conflicting Evidence Resolution**: Static dependency present, but runtime flow bypasses $\implies$ candidate + conflict recorded.
12. **Incremental Scoping**: Modifying `PasswordResetService` recomputes Auth, leaving Payment untouched.
13. **Deleted Resource Impact**: Deleting `AuthService.login()` records deletion impact with high severity.
14. **Criticality Prioritization**: High criticality features are ranked above low criticality features.
15. **Documentation Injection Defense**: Prompt injection in change notes or docs is safely neutralized without execution.

---

## 3. Running the Test Suites

To run all impact tests:
```bash
npx vitest run tests/knowledge/features/impact/
```

To run a specific test suite:
```bash
npx vitest run tests/knowledge/features/impact/syntheticCases.test.ts
```

To run with coverage:
```bash
npx vitest run tests/knowledge/features/impact/ --coverage
```
