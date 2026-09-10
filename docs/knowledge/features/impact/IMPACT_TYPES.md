# Impact Classification & Impact Types

## 1. Impact Types

The engine categorizes impacts into 8 specialized types (`ImpactType`):

| Impact Type | Description | Example Scenario |
| :--- | :--- | :--- |
| `DIRECT` | Direct modification to a resource explicitly mapped to the feature. | Modifying `AuthService.login()` affects Authentication. |
| `INDIRECT` | Downstream consequence propagated across one or more dependency hops. | Modifying Authentication affects Checkout because Checkout depends on Auth. |
| `API` | Public contract, route, or endpoint modification. | Changing the request body schema of `POST /api/v1/checkout`. |
| `DATA` | Database schema, table, migration, or entity definition change. | Adding a required column to the `users` table. |
| `INTEGRATION` | External service client, webhook, or gateway adapter change. | Updating Stripe SDK payment adapter version or credentials format. |
| `BEHAVIORAL` | Flow routing, state transition, or business logic sequence change. | Changing checkout state machine transitions or branching logic. |
| `VERIFICATION` | Test suite, assertion, mock, or test helper change. | Modifying `AuthService.test.ts`. |
| `CONFIG` | Configuration file, environment variable, or feature flag change. | Modifying `auth.jwtSecret` or `featureFlags.betaCheckout`. |

---

## 2. Impact Type Precedence & Normalization

When multiple evidence items indicate different impact types for the same feature target, `ImpactNormalizer` applies strict domain precedence:

1. **Specialized Semantic Types (`API`, `DATA`, `INTEGRATION`, `BEHAVIORAL`, `CONFIG`)**:
   - If an endpoint or schema change directly impacts a feature, the engine retains the specialized type (e.g. `API` or `DATA`) while preserving `direct: true`.
2. **Verification Boundary (`VERIFICATION`)**:
   - If evidence originates solely from test resources, the impact is strictly typed as `VERIFICATION`.
3. **Direct vs. Indirect (`DIRECT` vs. `INDIRECT`)**:
   - Direct changes (distance 0) without specialized types are typed as `DIRECT`.
   - Propagated multi-hop changes (distance $\ge 1$) default to `INDIRECT`.

---

## 3. Impact Severity Levels

Impact severity is derived from the calculated 0–100 impact score:

| Severity Level | Score Range | Description | Recommended Action |
| :--- | :--- | :--- | :--- |
| `CRITICAL` | 80–100 | System-critical or breaking change directly affecting core operations. | Immediate regression testing and code review. |
| `HIGH` | 60–79 | Significant impact across primary workflows or high-criticality features. | Targeted verification of affected downstream flows. |
| `MEDIUM` | 40–59 | Moderate indirect impact or localized structural modification. | Standard test execution. |
| `LOW` | 20–39 | Minor leaf change with limited downstream reach. | Routine review. |
| `NEGLIGIBLE` | 0–19 | Incidental change with trivial or distant consequence. | Informational only. |
