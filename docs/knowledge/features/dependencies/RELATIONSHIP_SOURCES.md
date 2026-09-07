# Relationship Signal Sources

The engine integrates **10 distinct signal sources** to project semantic relationships from technical artifacts.

---

### 1. `CodeDependencySource`
- **Focus**: File-to-file and symbol-level imports or function calls between mapped feature resources.
- **Filtering**: Filters generic standard/runtime libraries (`lodash`, `react`, `express`, `fs`, `path`, etc.) so they do not produce fake dependencies.
- **Output**: `DEPENDS_ON` ($score \ge 0.85$).

### 2. `SharedResourceSource`
- **Focus**: Detects technical files/utilities mapped to more than one feature in Phase 6.3.
- **Semantics**: Sharing a technical utility does **not** equal a direct execution dependency.
- **Output**: `SHARES_RESOURCE` (`BIDIRECTIONAL`, $score = 0.85$).

### 3. `EndpointInteractionSource`
- **Focus**: HTTP/API endpoints, route callers, and security middleware.
- **Rules**:
  - If endpoint in Feature A is protected by middleware in Feature B $\to$ Feature A `DEPENDS_ON` Feature B ($score \ge 0.95$).
  - If Feature A invokes API endpoint of Feature B $\to$ Feature A `CONSUMES` Feature B ($score \ge 0.92$).
- **Output**: `DEPENDS_ON`, `CONSUMES`, `AUTHORIZES`.

### 4. `DataDependencySource`
- **Focus**: Database entities, foreign key constraints, and cross-feature table queries.
- **Rules**:
  - Foreign key reference $\to$ `USES` ($score = 0.75$).
  - Entity mapped across multiple features $\to$ `SHARES_DATA` (`BIDIRECTIONAL`, $score = 0.85$).
- **Output**: `USES`, `SHARES_DATA`.

### 5. `ConfigurationDependencySource`
- **Focus**: Environment variables, configuration files, and integration connection strings.
- **Security**: Strict secret redaction (`[REDACTED]`) via `SecuritySanitizer`.
- **Output**: `INTEGRATES_WITH` ($score = 0.50$).

### 6. `ModuleDependencySource`
- **Focus**: Architectural module boundaries and package-level exports/imports.
- **Output**: `DEPENDS_ON`, `COORDINATES`, `COMPOSES` ($score = 0.80$).

### 7. `IntegrationDependencySource`
- **Focus**: Asynchronous event publishing and message consumption channels.
- **Rules**:
  - Publisher $\to$ Subscriber: `TRIGGERS` ($score = 0.85$).
  - Subscriber $\to$ Publisher: `CONSUMES` ($score = 0.85$).
- **Output**: `TRIGGERS`, `CONSUMES`.

### 8. `ArchitectureDependencySource`
- **Focus**: Layered capability declarations (Platform, Domain, Application, Infrastructure).
- **Rules**:
  - Platform $\to$ Application: `PROVIDES` ($score = 0.80$).
  - Application $\to$ Platform: `DEPENDS_ON` ($score = 0.80$).
- **Output**: `PROVIDES`, `DEPENDS_ON`.

### 9. `TestRelationshipSource`
- **Focus**: Integration tests verifying multiple features together.
- **Constraint**: Test assertions are treated as **supporting evidence only** ($score \le 0.65$), never overriding direct code reality.
- **Output**: `VERIFIES`.

### 10. `HistoryRelationshipSource`
- **Focus**: Historical Git commit co-change coupling.
- **Constraint**: Co-change correlation indicates association, not hard runtime invocation.
- **Output**: `ASSOCIATED_WITH` (`UNDIRECTED`, $score \le 0.40$, confidence `LOW`).
