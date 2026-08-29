# ADR 002: Transition to Global Workspace Architecture

## Status
Accepted

## Context
In v1.0, ProjectMind operated exclusively as a localized tool. It stored all its data, including internal SQLite databases, memory logs, and parsed graphs, directly inside the target repository under a `.projectmind/` directory.

While this approach offered zero-configuration portability, it introduced significant drawbacks as the project matured:
1. **Git Conflicts:** Users constantly had to add `.projectmind/` to `.gitignore`. Even then, sharing repositories across teams led to localized intelligence being isolated to single machines.
2. **Storage Inefficiency:** Large models (SLMs/LLMs) and embeddings were duplicated across every repository, wasting massive amounts of disk space.
3. **Lack of Global Analytics:** Because data was isolated, it was impossible to run cross-repository queries (e.g., "Which of my projects use React 18?").
4. **Tooling Ecosystem:** It was difficult to build centralized GUI tools or system-tray daemons because they had to scan the hard drive to find repositories, rather than reading a central registry.

## Decision
We are moving to a **Global Workspace Architecture** for v2.0.

1. **Pointer Only:** The local repository will now only contain a `.projectmind.json` pointer file containing a globally unique UUID.
2. **Centralized Data:** All physical storage, databases, and logs will be moved to the OS-specific application data directory (e.g., `%LOCALAPPDATA%/ProjectMind/` or `$XDG_DATA_HOME/projectmind/`).
3. **Workspace API Layer:** We are introducing a strict `Workspace API` and a `Storage Abstraction Layer` to decouple the core extraction logic from the underlying databases (SQLite, KuzuDB).

## Consequences

### Positive
* **Shared Resources:** Models, plugins, and datasets are stored once in the Global Workspace, vastly reducing disk usage.
* **Global Registry:** A central SQLite registry enables instant lookups, cross-repo analytics, and a foundation for future GUI applications.
* **Pristine Repositories:** The repository remains clean, containing only a tiny, version-controllable JSON pointer.
* **Future-Proofing:** The `Workspace API` allows us to eventually build enterprise cloud-sync features without rewriting the core Kernel.

### Negative
* **Complexity:** Introduces the need for path resolution (`WorkspacePathResolver`), registry synchronization, and lifecycle management (e.g., what happens when a folder is moved).
* **Migration Overhead:** Requires a complex `MigrationEngine` to upgrade existing v1.0 users safely.

## Notes
The `MigrationEngine` must guarantee zero data loss and support automatic rollbacks to mitigate the risks associated with this major architectural shift.
