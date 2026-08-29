# Recovery Engine

Phase 4.8 manages the aftermath of a failed Verification (Phase 4.7). It is designed to act as a highly controlled, deterministic safety net, preventing the AI from falling into infinite loops of broken code generation.

## Core Principle
**NO DIRECT SOURCE MODIFICATION.** 
The Recovery Engine is forbidden from modifying files directly. If a repair is needed, it generates a `REPAIR` strategy and hands it back to the top of the Agent Execution Pipeline (Phase 4.4 Security).

By routing all repairs through the standard pipeline, we ensure that:
1. Security Policies are enforced on the fix.
2. Rollback snapshots are updated.
3. The fix is re-verified properly.
