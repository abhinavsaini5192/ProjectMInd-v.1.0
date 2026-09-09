# Health Signal System (12 Signal Providers)

Signals represent objective, observable facts extracted from the feature context.

## Signal Structure

```typescript
export interface HealthSignal {
  signalId: string;
  featureId: string;
  signalType: HealthSignalType;
  severity: HealthSignalSeverity;
  value: number | string | boolean;
  normalizedValue: number; // 0 to 100
  description: string;
  evidence: FeatureRiskEvidence[];
  source: string;
  confidence: number;
  detectedAt: number;
  knowledgeVersion: string;
}
```

---

## The 12 Signal Providers

1. **ComplexityHealthSignal**:
   - `HIGH_CYCLOMATIC_COMPLEXITY`: Methods with complexity $\ge$ 20.
   - `DEEP_NESTING`: Indentation or block depth $\ge$ 5.
   - `LARGE_FILE_SIZE`: Files $\ge$ 800 LOC.

2. **CouplingHealthSignal**:
   - `HIGH_EFFERENT_COUPLING`: Outgoing feature dependencies $\ge$ 10.
   - `HIGH_AFFERENT_COUPLING`: Incoming feature dependents $\ge$ 10.
   - `TIGHT_COUPLING`: Dependency coupling strength $\ge$ 0.85.
   - `UNBALANCED_COUPLING`: Both high inbound and outbound hub bottleneck.

3. **DependencyHealthSignal**:
   - `CIRCULAR_FEATURE_DEPENDENCY`: Invalidation cycle loops.
   - `EXCESSIVE_DEPENDENCIES`: Direct dependencies $\ge$ 15.
   - `DEPRECATED_DEPENDENCY`: Deprecated external library usage.
   - `UNPINNED_DEPENDENCY`: Unpinned semver ranges (`*`, `^`, `latest`).

4. **VerificationHealthSignal**:
   - `MISSING_TESTS`: Zero test files associated with feature.
   - `LOW_TEST_COVERAGE`: Test resource ratio $< 20\%$.
   - `NO_INTEGRATION_TESTS`: Endpoints present without integration/E2E tests.
   - `UNTESTED_CRITICAL_FLOW`: Authentication or payment flow lacking test verification.

5. **BehaviorHealthSignal**:
   - `COMPLEX_EXECUTION_FLOW`: Single flow exceeding 10 steps.
   - `UNHANDLED_ERROR_PATH`: Sensitive flow without error recovery steps.
   - `UNTERMINATED_FLOW`: Flow ending abruptly without terminal return or response.

6. **ArchitectureHealthSignal**:
   - `LAYER_VIOLATION`: UI component accessing database directly without service.
   - `SHARED_DATABASE_TABLE`: Concurrency hazard of database entity shared across features.
   - `BYPASSED_ABSTRACTION`: Direct hardware or low-level driver invocation.

7. **StabilityHealthSignal**:
   - `HIGH_CHURN_RATE`: Modification churn score $\ge$ 15.
   - `FREQUENT_BUG_FIXES`: 5+ defect fix commits targeting feature.
   - `RECENT_BREAKING_CHANGE`: Interface change breaking downstream features.

8. **ChangeFrequencyHealthSignal**:
   - `HOTSPOT_DETECTED`: 2.5x repository average change frequency.
   - `RAPID_SUCCESSIVE_CHANGES`: Fast commit velocity.

9. **IntegrationHealthSignal**:
   - `UNDOCUMENTED_API_ENDPOINT`: Exposed endpoint lacking OpenAPI / doc comment.
   - `MISSING_TIMEOUT_CONFIGURATION`: Remote HTTP client without timeout.
   - `MISSING_CIRCUIT_BREAKER`: External service dependency without circuit breaker.

10. **SecurityHealthSignal**:
    - `EXPOSED_SECRET`: Secret / token detected via `SecuritySanitizer`.
    - `MISSING_AUTHENTICATION`: Sensitive endpoint lacking authentication guard.
    - `PERMISSIVE_CORS`: Origin wildcard `*` allowed.
    - `PROMPT_INJECTION_VULNERABILITY`: Suspicious instruction override detected in docs.

11. **ConfidenceHealthSignal**:
    - `LOW_DISCOVERY_CONFIDENCE`: Model certainty $< 50\%$.
    - `LOW_MAPPING_CONFIDENCE`: Over $40\%$ low-confidence resource links.
    - `STALE_KNOWLEDGE`: Stale feature knowledge cache.

12. **ResourceHealthSignal**:
    - `SINGLE_POINT_OF_FAILURE`: Exactly 1 file handles 3+ endpoints.
    - `ORPHAN_FEATURE_COMPONENT`: Disconnected unreferenced mapped files.
