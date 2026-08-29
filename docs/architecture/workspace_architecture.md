
<!-- Original File: WORKSPACE_CORE.md -->

# Workspace Core Architecture

The Workspace Core acts as the operating system for ProjectMind v2.0. It is a highly decoupled, dependency-injected subsystem responsible for orchestrating the lifecycle of all workspaces, managing global configurations, and exposing a safe `WorkspaceAPI` to the runtime Kernel.

## Core Principles
1. **No direct storage access:** The Workspace Core uses injected interfaces (`IRegistryStore`, `IWorkspaceStore`) to remain database-agnostic.
2. **Centralized Pub/Sub:** All state changes are broadcast via the `IEventBus`.
3. **Structured Observability:** All operations log structured data through the `ILogger`.
4. **Strict State Machine:** The `WorkspaceLifecycleManager` enforces a rigorous state machine (Uninitialized -> Initializing -> Ready...).

## Core Modules
* **WorkspaceManager**: The grand orchestrator that brings together the locator, registry, and lifecycle managers.
* **WorkspaceLocator**: Resolves physical repository paths to their Global Workspace UUIDs.
* **WorkspaceHealthMonitor**: Modular validation suite checking registry, pointers, and storage integrity.
* **WorkspaceConfiguration**: Multi-layered configuration hierarchy (Defaults -> Global -> Workspace -> Env -> CLI).
* **RepositoryIdentityManager**: Generates and validates the UUIDs that link local code to global intelligence.

## Dependency Injection
The core utilizes a custom, lightweight `DIContainer` that supports Singletons, Transients, Scoped services, and Factories, with built-in circular dependency detection.


<!-- Original File: WORKSPACE_SPEC.md -->

# Workspace Specification

This document defines the physical layout and the logical rules of the ProjectMind Global Workspace Architecture (v2.0).

## 1. Global Workspace Concept

ProjectMind v2.0 fundamentally shifts from an embedded architecture (storing data directly in the target repository's `.projectmind/` folder) to a **Global Workspace Architecture**.

* **The Target Repository:** Remains pristine. The only trace of ProjectMind is a single, lightweight pointer file (`.projectmind.json`).
* **The Global Workspace:** A centralized location on the host operating system that securely stores all databases, models, intelligence, and metadata for every repository managed by ProjectMind.

### 1.1 Global Workspace Location
The Global Workspace must not be hardcoded to `~/.projectmind`. Instead, ProjectMind utilizes a `WorkspacePathResolver` to determine the correct application data directory according to standard OS conventions:

* **Windows:** `%LOCALAPPDATA%/ProjectMind/`
* **macOS:** `~/Library/Application Support/ProjectMind/`
* **Linux:** `$XDG_DATA_HOME/projectmind/` (or `~/.local/share/projectmind/` if not set)

## 2. Global Workspace Layout

The Global Workspace is organized into shared resources and individual runtime workspaces.

```text
<OS_APP_DATA>/ProjectMind/
├── registry/          # Central SQLite Registry (repositories, plugins, models)
├── config/            # Global CLI and daemon configuration
├── plugins/           # Globally installed extensions and plugins
├── models/            # Downloaded SLMs/LLMs and embedding models
├── datasets/          # Curated datasets shared across workspaces
├── benchmarks/        # System benchmarks and evaluation results
├── cache/             # Global cache for reusable resources (e.g., standard libraries)
├── logs/              # Daemon and system-wide logs
├── backups/           # Automated point-in-time workspace backups
├── snapshots/         # Versioned snapshots for fallback and recovery
├── telemetry/         # Opt-in diagnostic telemetry and performance metrics
├── runtime/           # Ephemeral state, IPC sockets, and lockfiles
└── workspaces/        # Individual repository workspaces (keyed by UUID)
    ├── <repo_uuid_1>/
    ├── <repo_uuid_2>/
    └── ...
```

## 3. Repository Pointer File (`.projectmind.json`)

Inside every repository initialized with ProjectMind v2.0, a pointer file acts as the repository's identity and link to the Global Workspace.

**File:** `<repository_root>/.projectmind.json`

**Schema:**
```json
{
  "repositoryId": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceVersion": "2.0",
  "createdAt": "2026-08-04T12:00:00Z",
  "workspaceType": "global"
}
```

* **`repositoryId`**: A globally unique UUID linking the repository to its global workspace folder.
* **`workspaceVersion`**: Enables the MigrationEngine to gracefully handle future upgrades.
* **`workspaceType`**: Reserved for future cloud, remote, or enterprise synchronization modes.

## 4. Repository Workspace Layout

The workspace belonging to a specific repository (`workspaces/<repo_uuid>/`) is organized by **subsystem concern**, rather than by the underlying storage technology used. This ensures that ProjectMind's internal directories do not need to change if we swap database engines (e.g., SQLite for KuzuDB).

```text
workspaces/<repo_uuid>/
├── state/           # Serialized state machines, progress trackers, intent
├── intelligence/    # Inferred semantic diffs, semantic understandings
├── context/         # Generated output context manifests (Markdown)
├── research/        # Saved agent research, literature, documentation scrapes
├── cache/           # Ephemeral repository-specific cache (e.g. AST intermediate files)
├── snapshots/       # Point-in-time repository intelligence snapshots
├── logs/            # Repository-specific execution logs
├── metadata/        # Internal workspace metadata, custom repo config
└── databases/       # Opaque directory managed entirely by the Storage Abstraction Layer
    ├── registry.db  # (Example) SQLite file
    └── graph/       # (Example) KuzuDB graph directory
```

**Constraint:** No ProjectMind subsystem outside of the **Storage Abstraction Layer** may read from or write to the `databases/` directory directly.

## 5. Definition of Done Checklist

- [x] Defined the Global Workspace layout incorporating `benchmarks`, `telemetry`, and `runtime`.
- [x] Documented the use of `WorkspacePathResolver` for OS-specific paths.
- [x] Defined the pointer file schema including `repositoryId`, `workspaceVersion`, `createdAt`.
- [x] Defined the repository workspace layout organized by subsystem (`state/`, `intelligence/`, etc.).

