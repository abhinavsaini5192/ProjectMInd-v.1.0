# Agent Core & Runtime

The Agent Core provides the foundational orchestration layer for ProjectMind Phase 4. 

The `AgentRuntime` accepts tasks and spins up individual `Agent` instances. Each `Agent` owns a specific `AgentTask` and manages its progression through a strict lifecycle.

## Boundaries
The Agent is strictly an orchestrator. It does not:
- Execute shell commands.
- Modify the file system.
- Query databases directly.
- Call Small Language Models (SLMs) directly.

Instead, it relies on interfaces (like the `IBrainGateway`) to retrieve intelligence from the ProjectMind Brain (Layer 3).
