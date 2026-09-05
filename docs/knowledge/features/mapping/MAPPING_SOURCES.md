# Mapping Sources (Signal Providers)

Phase 6.3 incorporates **11 specialized mapping sources**, each responsible for a distinct technical domain in the codebase:

---

## 1. `FileMappingSource`
- **Resource Type**: `FILE`
- **Responsibilities**:
  - Maps source files whose path, directory structure, or internal symbols align with the feature.
  - Excludes generic utilities (`isGenericUtility`).
  - Infers roles based on file suffixes (`.controller.ts` $\to$ `API`, `.service.ts` $\to$ `IMPLEMENTATION`, `.repo.ts` $\to$ `STORAGE`).

## 2. `SymbolMappingSource`
- **Resource Type**: `SYMBOL`
- **Responsibilities**:
  - Maps classes, functions, and interfaces.
  - Role classification heuristics:
    - `Controller`, `Handler`, `Route` $\to$ `API`
    - `Repository`, `Store`, `DAO`, `Entity` $\to$ `STORAGE`
    - `Service`, `Processor`, `Engine`, `Manager` $\to$ `IMPLEMENTATION`
    - `Config`, `Settings` $\to$ `CONFIGURATION`

## 3. `ModuleMappingSource`
- **Resource Type**: `MODULE`
- **Responsibilities**:
  - Maps container packages and folders to features.
  - Emphasizes the foundational principle: **`module != feature`**. A single module (e.g. `src/iam`) can implement multiple features (`Authentication`, `User Management`), and a feature can span multiple modules.
  - Role: `ORCHESTRATION`.

## 4. `EndpointMappingSource`
- **Resource Type**: `ENDPOINT`
- **Responsibilities**:
  - Maps HTTP/RPC API routes (e.g. `POST /api/v1/auth/login`).
  - Automatically receives `VERY_HIGH` confidence ($\ge 0.92$) and `ENTRY_POINT` role.

## 5. `DependencyMappingSource`
- **Resource Type**: `DEPENDENCY`
- **Responsibilities**:
  - Maps third-party npm/yarn packages to features (e.g., `jsonwebtoken`, `bcrypt` $\to$ `Authentication`).
  - Differentiates domain services from integrations (`stripe`, `paypal` $\to$ `INTEGRATION`).
  - **Filters out universal utilities**: `lodash`, `date-fns`, `moment`, `chalk`, `winston`, `axios`, `express`, `react`, `typescript`, `vitest`, `jest`.

## 6. `ConfigurationMappingSource`
- **Resource Type**: `CONFIGURATION`
- **Responsibilities**:
  - Maps environment variables and configuration properties (e.g., `AUTH_JWT_SECRET`, `PAYMENT_STRIPE_KEY`).
  - **Strict Security Sanitization**: Redacts sensitive secret values. Secrets are never exposed in candidate metadata or stored in mapping evidence.

## 7. `DatabaseMappingSource`
- **Resource Type**: `DATABASE` & `DATABASE_ENTITY`
- **Responsibilities**:
  - Maps database tables, schemas, and ORM entities.
  - Supports shared persistence: for example, the `User` entity is mapped to `Authentication` as `STORAGE` and `User Management` as `IMPLEMENTATION`.

## 8. `TestMappingSource`
- **Resource Type**: `TEST`
- **Responsibilities**:
  - Maps automated unit, integration, and E2E test suites (e.g. `tests/auth/authService.test.ts`).
  - Role: `VERIFICATION`.

## 9. `UIComponentMappingSource`
- **Resource Type**: `UI_COMPONENT`
- **Responsibilities**:
  - Maps user interface presentation components (e.g., `LoginForm.tsx`, `BillingCard.tsx`).
  - Role: `UI`.

## 10. `CommandMappingSource`
- **Resource Type**: `COMMAND`
- **Responsibilities**:
  - Maps CLI commands, console tasks, or scheduled jobs (e.g. `auth:login`).
  - Role: `COMMAND`.

## 11. `DocumentationMappingSource`
- **Resource Type**: `DOCUMENTATION`
- **Responsibilities**:
  - Maps markdown guides, README sections, and architecture documentation.
  - **Adversarial Hardening**: Treats all documentation text as untrusted evidence. Strips prompt injections and does not execute markdown contents.
