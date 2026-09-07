# Catalog: Flow Types & Step Types

## 1. Flow Types (12 Categories)

| Flow Type | Semantic Definition | Typical Scenario |
| :--- | :--- | :--- |
| `PRIMARY` | Golden happy-path flow satisfying the primary feature requirement. | User submits valid credentials and logs in successfully. |
| `ALTERNATIVE` | Valid secondary execution path achieving the same or related outcome. | User logs in via OAuth provider instead of password. |
| `FAILURE` | Error handling, validation rejection, or exception fallback path. | Invalid credentials, expired session, database timeout. |
| `VALIDATION` | Schema, type, or constraint verification execution path. | Request payload validated against Zod schema. |
| `AUTHORIZATION` | Permission checking, RBAC verification, token verification. | JWT verified by middleware before handler execution. |
| `DATA` | Data pipeline, transformation, serialization, or enrichment. | Raw input DTO transformed into domain entity. |
| `API` | Request-response HTTP endpoint execution flow. | `POST /checkout` $\to$ Controller $\to$ Service $\to$ 201 Created. |
| `EVENT` | Event-driven decoupled pub/sub flow. | `OrderCreated` event published to message broker. |
| `ASYNC` | Background job execution or asynchronous queue processing. | Worker consumes queue item and converts video. |
| `INTEGRATION` | Interfacing with third-party external service or SDK. | Stripe charge, Twilio SMS dispatch, GitHub webhook. |
| `TRANSACTION` | ACID transactional boundary execution. | Balance transfer with rollback on failure. |
| `OBSERVABILITY` | Telemetry, logging, metrics, or audit recording flow. | Audit log entry written after sensitive operation. |

---

## 2. Step Types (18 Categories)

| Step Type | Tier / Role | Description |
| :--- | :--- | :--- |
| `ENTRY_POINT` | Ingress | API route, CLI command, UI event handler, or scheduler trigger. |
| `VALIDATION` | Ingress Guard | Schema validator, parameter check, body verification. |
| `AUTHORIZATION` | Security Guard | Auth guard, RBAC gate, token verification, session checker. |
| `CONTROLLER` | Orchestration | HTTP controller receiving routed request. |
| `HANDLER` | Orchestration | Event handler, command handler, message worker. |
| `SERVICE` | Business Logic | Domain service executing business rules. |
| `FUNCTION` | Utility / Logic | Helper function or mathematical algorithm. |
| `REPOSITORY` | Data Access | Data access layer mediating between domain and database. |
| `DATABASE` | Storage | Database table, collection, entity, or persistent model. |
| `CACHE` | Storage | Redis, Memcached, or in-memory state store. |
| `EVENT` | Messaging | Domain event emitted into system. |
| `QUEUE` | Messaging | Message queue, Kafka topic, RabbitMQ exchange. |
| `EXTERNAL_SERVICE`| External | Third-party SDK, payment gateway, external REST API. |
| `TRANSFORMATION`| Data Processing | DTO mapping, sanitization, serialization. |
| `CONDITION` | Control Flow | Conditional branching decision point (e.g. `is_valid ?`). |
| `ERROR_HANDLER`| Resilience | Catch block, exception filter, fallback handler. |
| `RESPONSE` | Egress | HTTP response payload (200 OK, 201 Created, etc.). |
| `EXIT` | Egress | Terminal termination point of flow. |
