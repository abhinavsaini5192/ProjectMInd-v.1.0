# Task State Machine & Transitions

The `TaskStateMachine` defines explicit, enforceable states for autonomous tasks.

## States
- `CREATED`: Task initialized with parsed goals and constraints.
- `UNDERSTANDING`: Task requirements and scope parsed.
- `CONTEXT_GATHERING`: Incremental context assembled via `ContextEngine`.
- `REASONING`: Evidence-grounded structured reasoning executed.
- `PLANNING`: Directed Acyclic Graph (DAG) action plan formulated.
- `PLAN_VALIDATION`: Preconditions, dependencies, and risk checks validated.
- `WAITING_FOR_APPROVAL`: Paused for human authorization on high-risk actions (`DELETE`).
- `EXECUTING`: Dispatched to `ExecutionGate` and tools.
- `VERIFYING`: Tests, builds, and invariant checks evaluated.
- `ANALYZING`: Feedback and outcome evaluated by `FeedbackEngine`.
- `REPLANNING`: Initiates next cycle with revised context.
- `WAITING_FOR_USER`: Paused for interactive user clarification.
- `COMPLETED`: Success criteria met with zero unresolved blockers.
- `STALLED`: Bounded loop or progress guard triggered.
- `FAILED`: Terminal error encountered.
- `CANCELLED`: Interrupted by explicit user cancellation.
