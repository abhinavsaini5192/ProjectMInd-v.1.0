# Rollback System

The `RollbackManager` acts as the safety net for the Modification Engine.

## Process
Before any mutation is allowed, the engine calls `createSnapshot`. This saves the entire contents of the target file into memory, alongside its SHA-256 hash.

If Phase 4.5 Execution crashes (e.g. out of memory, or a downstream dependency blocks completion), the `ModificationTransaction` catches the throw and triggers `rollback()`. The `RollbackManager` instantly restores the file from memory, guaranteeing the user's workspace is never left in a corrupted half-applied state.
