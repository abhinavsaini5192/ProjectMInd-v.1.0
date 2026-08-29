# Security Audit Logging

The `SecurityAuditLogger` guarantees that every single decision made by the `DecisionEngine` is recorded and broadcast over the `KernelEventDispatcher`.

## Secret Redaction
Before broadcasting the event, the logger runs `redactSecrets`. This scrubs parameters for any keys containing terms like `password`, `secret`, `token`, `key`, or `api_key`, replacing their values with `[REDACTED]`.

This ensures that while the system remains fully auditable, it does not leak secrets into the event telemetry.
