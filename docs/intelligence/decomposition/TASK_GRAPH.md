# Task Graph & Dependency Architecture

The `TaskGraph` represents the directed acyclic graph (DAG) of executable subtasks.

## Models
- `TaskGraph`: Versioned DAG holding subtask nodes and dependency edges.
- `Subtask`: Individual unit of work with type (`DISCOVERY`, `ANALYSIS`, `DESIGN`, `IMPLEMENTATION`, `TESTING`, `VERIFICATION`, `USER_DECISION`), complexity, and required context hints.
- `SubtaskDependency`: Typed dependency (`HARD`, `SOFT`, `INFORMATIONAL`) governing topological execution order.
