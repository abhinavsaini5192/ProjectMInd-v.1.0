# Agent Events

Every transition and significant action within the Agent Core emits an event via the `KernelEventDispatcher`.

## Core Events
- `AgentCreated`
- `AgentStarted`
- `TaskReceived`
- `UnderstandingStarted`
- `UnderstandingCompleted`
- `PlanningStarted`
- `PlanningCompleted`
- `ExecutionStarted`
- `VerificationStarted`
- `TaskCompleted`
- `TaskFailed`
- `AgentCancelled`

## Traceability
All events carry a uniform `AgentEventPayload` containing:
- `agentId`
- `sessionId`
- `repositoryId`
- `taskId`
- `timestamp`

This ensures that system observability is maintained without logging raw source code, PII, or API secrets.
