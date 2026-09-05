# Mapping Model Specification

## 1. `FeatureResourceMapping` (Canonical Entity)

The persistent representation of a link between a feature and a repository resource:

```typescript
export interface FeatureResourceMapping {
  mappingId: string;
  featureId: string;
  resourceId: string;
  resourceType: MappingResourceType;
  role: MappingRole;
  confidence: MappingConfidence;
  score: number;
  evidence: MappingEvidence[];
  source: MappingSource;
  scope: MappingScope;
  createdAt: number;
  updatedAt: number;
  knowledgeVersion: string;
  mappingVersion: number;
  active: boolean;
  deactivationReason?: string;
}
```

---

## 2. Resource Types (`MappingResourceType`)

| Resource Type | Description |
|---|---|
| `FILE` | Source code file on filesystem |
| `SYMBOL` | Class, interface, function, method, or variable |
| `MODULE` | Container folder, package, or export namespace |
| `ENDPOINT` | HTTP/RPC route (e.g. `POST /api/v1/auth/login`) |
| `DEPENDENCY` | External package dependency from `package.json` |
| `CONFIGURATION`| Configuration key, environment flag, or setting |
| `DATABASE` | Storage schema, collection, or database table |
| `DATABASE_ENTITY` | ORM entity, database model, or table representation |
| `TEST` | Test suite, spec file, or verification case |
| `UI_COMPONENT` | Presentation layer component (React, Vue, HTML) |
| `COMMAND` | CLI command, terminal script, or executable task |
| `DOCUMENTATION` | Markdown file, guide section, or API specification |

---

## 3. Relationship Roles (`MappingRole`)

Roles define the exact technical function the resource fulfills for the feature:

- `ENTRY_POINT`: Primary entry gateway (e.g., API router, public endpoint)
- `IMPLEMENTATION`: Core business logic service or domain processor
- `SUPPORT`: Ancillary helper or secondary utility
- `DEPENDENCY`: Third-party external library required by the feature
- `CONFIGURATION`: Configuration options, environment variables, or flags
- `STORAGE`: Database tables, repositories, DAOs, or persistent entities
- `TEST` / `VERIFICATION`: Automated test suites asserting correctness
- `API`: Controller or interface defining external contracts
- `UI`: User interface presentation component
- `COMMAND`: Terminal or CLI command triggering feature execution
- `DOCUMENTATION`: Design documents, architecture records, or guides
- `INTEGRATION`: Third-party vendor integration (e.g. Stripe, AWS SES)
- `ORCHESTRATION`: Workflow coordinator or pipeline runner
- `OBSERVABILITY`: Logging, metrics, or telemetry hooks
- `INFRASTRUCTURE`: Docker, Kubernetes, or deployment resources

---

## 4. Confidence Levels (`MappingConfidence`)

Calculated from normalized scores $[0.0, 1.0]$:

- `VERY_HIGH`: $0.90 \le \text{score} \le 1.00$
- `HIGH`: $0.70 \le \text{score} < 0.90$
- `MEDIUM`: $0.45 \le \text{score} < 0.70$
- `LOW`: $0.20 \le \text{score} < 0.45$
- `VERY_LOW`: $0.00 \le \text{score} < 0.20$

---

## 5. Provenance (`MappingSource`)

- `MANUAL`: Established directly by a software developer or architect. Strictly protected from automated overwrites.
- `DISCOVERED`: Automatically derived from repository structural and semantic extraction.
- `INFERRED`: Derived transitively through dependency or call graph relationships.
- `IMPORTED`: Imported from an external specification, manifest, or OpenAPI schema.
