# Task Scheduler Architecture

The `KernelScheduler` manages computational priorities across ProjectMind.

## Priority Levels
1. **Critical**: Recovery procedures.
2. **High** (`Immediate`): User-initiated API requests.
3. **Normal** (`Delayed`): Debounced graph updates.
4. **Low**: Cleanups.
5. **Background**: Large codebase ingests.

Currently backed by a simple in-memory queue (`KernelJobQueue`), but designed to be interchangeable with a Redis or SQLite-backed queue in distributed environments.
