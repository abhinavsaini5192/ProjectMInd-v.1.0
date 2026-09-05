# Mapping Roles & Priority Hierarchy

## Semantics of Mapping Roles

In Phase 6.3, every mapping assignment specifies a **`MappingRole`** describing how the resource relates to the feature:

| Role | Meaning | Example |
|---|---|---|
| `ENTRY_POINT` | Public entrance into feature execution | `POST /login`, `cli auth:login` |
| `IMPLEMENTATION` | Core domain logic, business algorithms | `AuthService.ts`, `TokenGenerator.ts` |
| `API` | Interface contract, controller, route definition | `AuthController.ts`, `AuthResolver.ts` |
| `STORAGE` | Persistence model, repository, table, collection | `UserRepository.ts`, `users_table` |
| `CONFIGURATION` | Config keys, environment flags, settings | `AUTH_JWT_SECRET`, `auth.config.json` |
| `TEST` / `VERIFICATION` | Automated test suites asserting correctness | `authService.test.ts` |
| `UI` | Presentation components | `LoginForm.tsx`, `UserBadge.vue` |
| `COMMAND` | Console or CLI command triggering feature | `auth:login` |
| `INTEGRATION` | External service provider integration | `StripeClient.ts`, `AwsS3Adapter.ts` |
| `ORCHESTRATION` | High-level module coordinator | `iam/index.ts`, `WorkflowEngine.ts` |
| `SUPPORT` | Ancillary helper or internal utility | `authHashHelper.ts` |
| `DOCUMENTATION` | Architectural guides, manuals, specifications | `docs/auth/ARCHITECTURE.md` |
| `OBSERVABILITY` | Monitoring, logging, metrics hooks | `authMetrics.ts` |
| `INFRASTRUCTURE` | Deployment scripts, container definitions | `Dockerfile.auth` |
| `DEPENDENCY` | Third-party library import | `jsonwebtoken` package |

---

## Role Priority Hierarchy

When a single resource receives competing role proposals from multiple sources (e.g., `FileMappingSource` proposes `SUPPORT` while `EndpointMappingSource` proposes `ENTRY_POINT`), the `FeatureMappingResolver` applies the role priority hierarchy:

```
Rank 10: ENTRY_POINT
Rank  9: IMPLEMENTATION
Rank  8: API
Rank  7: STORAGE
Rank  6: CONFIGURATION
Rank  5: TEST / VERIFICATION
Rank  4: UI / COMMAND / INTEGRATION
Rank  3: ORCHESTRATION
Rank  2: SUPPORT
Rank  1: DOCUMENTATION / OBSERVABILITY / INFRASTRUCTURE / DEPENDENCY
```

The dominant role is selected while **all evidence from all sources is retained and consolidated**.
