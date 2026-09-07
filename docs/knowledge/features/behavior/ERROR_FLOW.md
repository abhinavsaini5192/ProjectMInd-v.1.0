# Failure & Resilience Paths

## Overview

A robust understanding of feature behavior must encompass failure modes, error catches, validation rejections, and fallback policies.

---

## Detection & Modeling

The `ErrorFlowSource` identifies:
1. Try-catch blocks and exception throwing statements.
2. Global or route-specific exception filters.
3. HTTP error response mapping (400 Bad Request, 401 Unauthorized, 403 Forbidden, 500 Internal Error).

```mermaid
flowchart LR
    EP[ENTRY_POINT: POST /login] -->|FAILS_TO (error != null)| EH[ERROR_HANDLER: Error Response (401/400)]
```

---

## Flow Classification

Dedicated failure flows are assigned `flowType: 'FAILURE'` and categorized under `behavior.failureFlows`. This separates resilience logic from the golden path while providing complete visibility into failure recovery mechanisms.
