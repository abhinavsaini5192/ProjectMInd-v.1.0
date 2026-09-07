# Control Flow & Decision Branching

## Overview

Real-world features do not execute purely linear paths. They make runtime decisions based on validation results, permission checks, authentication credentials, and business rules.

---

## Decision Nodes

A decision point is modeled as a node with `stepType: 'CONDITION'`:

```mermaid
flowchart TD
    C[CONDITION: PasswordValidator Valid?]
    S[FUNCTION: GenerateToken (Success)]
    F[ERROR_HANDLER: Throw 401 (Failure)]

    C -->|condition == true| S
    C -->|condition == false (FAILS_TO)| F
```

---

## Edge Predicates

Edges outgoing from a `CONDITION` node are labeled with deterministic predicates:
- `condition == true`: Positive branch leading to primary workflow continuation.
- `condition == false`: Negative branch leading to error handlers with relation `FAILS_TO`.

This allows reasoning agents to trace both happy paths and alternate/failure paths systematically.
