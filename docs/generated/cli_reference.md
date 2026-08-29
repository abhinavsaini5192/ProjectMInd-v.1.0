# CLI Design Specification (v2.0)

The ProjectMind Command Line Interface (CLI) has been significantly expanded to support the Global Workspace Architecture. The CLI is the primary user interface for interacting with the `WorkspaceManager` and `WorkspaceRegistry`.

## 1. Core Workflow Commands

### 1.1 `projectmind init`
Initializes a new repository.
* Connects to the Global Registry, generates a UUID, creates `.projectmind.json`, and provisions the workspace.

### 1.2 `projectmind update`
Extracts intelligence and updates the Knowledge Graph and Context Manifests.
* Routes data through the `Workspace API`.

## 2. Workspace & Registry Management

### 2.1 `projectmind list`
Displays all repositories currently managed by the Global Workspace.
* **Output:** Table showing Repository Path, UUID, Status (Active/Archived), and Last Updated timestamp.
* **Subsystem:** Queries the `RegistryService`.

### 2.2 `projectmind workspace <subcommand>`
Provides deep introspection into the current repository's workspace.
* `projectmind workspace info`: Prints the physical path to the workspace (e.g., `%LOCALAPPDATA%/ProjectMind/workspaces/<uuid>`).
* `projectmind workspace clear-cache`: Purges the ephemeral cache for the current repo.

### 2.3 `projectmind registry <subcommand>`
Manages global-level settings and assets.
* `projectmind registry models`: Lists all installed SLMs/LLMs available to workspaces.
* `projectmind registry plugins`: Lists global plugins.

## 3. Lifecycle Commands

### 3.1 `projectmind relink`
Used when a repository folder has been moved or renamed on the host filesystem.
* Reads the UUID from the local `.projectmind.json`.
* Updates the physical path stored in the Global Registry to match the current working directory.

### 3.2 `projectmind remove`
Destroys the link and deletes the data.
* Prompts for confirmation.
* Deletes the `.projectmind.json` file.
* Purges the `workspaces/<uuid>` folder and removes the row from the SQLite registry.

### 3.3 `projectmind migrate [--dry-run]`
Upgrades a v1.0 `.projectmind/` folder to the v2.0 Global Workspace.
* `--dry-run`: Simulates the migration and outputs a summary of changes without modifying files.

## 4. Backup & Recovery

### 4.1 `projectmind backup`
Creates a point-in-time zip archive of the active workspace.
* Can be run globally (`--all`) or per-repository.
* Saves to the Global `backups/` directory.

### 4.2 `projectmind restore <backup_id>`
Restores a workspace from a previously created backup archive.
* Replaces the `state/`, `intelligence/`, and `databases/` directories with the contents of the backup.

## 5. System Health

### 5.1 `projectmind doctor [--repair]`
Executes the `WorkspaceHealthMonitor` validation suite.
* Checks for missing pointers, corrupt SQLite files, registry inconsistencies, and cache bloat.
* `--repair`: Attempts automated remediation for identified issues.

---

### Definition of Done Checklist
- [x] Defined all required CLI changes (`workspace`, `registry`, `relink`, `list`, `remove`, `migrate`, `backup`, `restore`).
- [x] Added `doctor` command based on Workspace Health requirements.
