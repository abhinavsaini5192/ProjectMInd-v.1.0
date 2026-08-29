# Autonomy Levels & Policies

ProjectMind enforces configurable autonomy levels:

## Supported Levels
- **`LEVEL_0_MANUAL`**: Every single action requires explicit manual user authorization.
- **`LEVEL_1_ASSISTED`**: Proposes reasoning and plans; requires approval before execution.
- **`LEVEL_2_CONTROLLED` (Default)**: Automatically executes low-to-medium risk plans within strict budget bounds; requires approval for high-risk operations.
- **`LEVEL_3_BOUNDED_AUTONOMOUS`**: Executes multi-cycle recovery and replanning autonomously within hard-capped budgets and policies.
- **`LEVEL_4_UNRESTRICTED`**: **EXPLICITLY FORBIDDEN**. The orchestrator will never execute unrestricted autonomous actions.
