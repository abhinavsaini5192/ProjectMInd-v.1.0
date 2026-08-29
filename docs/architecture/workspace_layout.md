# Workspace Layout Definitions

## Global Workspace Layout
Located at `%LOCALAPPDATA%/ProjectMind/` (Windows), `~/Library/Application Support/ProjectMind/` (Mac), or `~/.local/share/ProjectMind/` (Linux).

```text
ProjectMind/
├── config/
├── registry/
├── plugins/
├── models/
├── datasets/
├── benchmarks/
├── cache/
├── logs/
├── runtime/
├── backups/
├── snapshots/
└── workspaces/        <-- Contains individual Repository Workspaces
```

## Repository Workspace Layout
Located inside `ProjectMind/workspaces/<repository-uuid>/`.

```text
<repository-uuid>/
├── metadata/
├── state/
├── context/
├── research/
├── cache/
├── logs/
├── snapshots/
├── exports/
├── databases/
└── temp/
```
