# Modification Engine

Phase 4.6 sits directly between the Action Planner (Phase 4.3) and the Execution Engine (Phase 4.5). It is responsible for transforming a high-level `ModificationIntent` into a precise, validated source code patch.

## Flow
1. **Prepare Modification**: The engine is passed an intent (e.g. `MODIFY_FUNCTION`).
2. **Resolve Target**: `ContextResolver` finds the physical file and symbol boundaries.
3. **Snapshot**: `RollbackManager` saves the current state of the file.
4. **Generate Change**: `ChangeGenerator` crafts the patch text.
5. **Validate**: `PatchValidator` ensures the change hasn't broken syntax.
6. **Execution Integration**: The engine exposes a callback strategy (`executeTransaction`) so that the Phase 4.5 Executor can apply the patch. If execution fails, the engine orchestrates the rollback.
