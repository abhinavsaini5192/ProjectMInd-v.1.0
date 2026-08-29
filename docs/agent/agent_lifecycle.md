# Agent Lifecycle

The ProjectMind `AgentLifecycle` is a rigorous state machine designed to prevent invalid execution flows.

## Valid States
- `CREATED`: Agent instantiated, awaiting task.
- `INITIALIZING`: Task assigned, preparing dependencies.
- `UNDERSTANDING`: Requesting contextual intelligence from the Brain.
- `PLANNING`: (Placeholder) Generating actionable steps.
- `WAITING_APPROVAL`: Paused for human intervention.
- `EXECUTING`: (Placeholder) Applying changes.
- `VERIFYING`: (Placeholder) Validating changes.
- `RECOVERING`: Attempting to fix a failed verification.
- `COMPLETED`: Terminal success state.
- `FAILED`: Terminal error state.
- `CANCELLED`: Terminal aborted state.

## State Enforcement
Transitions are strictly policed. For example, moving from `COMPLETED` directly to `EXECUTING` throws an `InvalidAgentStateTransition` error, ensuring the agent cannot silently loop or become corrupted.
