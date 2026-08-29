# Recovery System

The `KernelRecoveryManager` is the last line of defense against fatal exceptions.

## Mechanism
- Intercepts uncaught exceptions and rejected promises from the `KernelTaskManager`.
- Flushes state to SQLite.
- Executes `rollback()` on active Pipelines.
- Attempts graceful degradation.
- Publishes `CrashRecovered` if the system is stabilized.
