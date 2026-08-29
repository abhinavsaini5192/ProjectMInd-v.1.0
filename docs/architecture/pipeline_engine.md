# Pipeline Engine Architecture

The `KernelPipeline` handles complex, multi-stage operations (e.g., saving to SQLite, then updating KuzuDB, then publishing a Semantic Event).

## Execution Guarantees
- **Atomicity Simulation**: If a stage fails, the pipeline halts and begins walking backward through the `completedStages`, calling `rollback()` on each.
- **Events**: Emits `PipelineStarted`, `PipelineCompleted`, and `PipelineRollback` to the global `KernelEventDispatcher`.
