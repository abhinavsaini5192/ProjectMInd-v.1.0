# Migration Strategy & Guide (v1.0 to v2.0)

Moving from ProjectMind v1.0 (local `.projectmind/` folders) to v2.0 (Global Workspace Architecture) is a major structural change. The `MigrationEngine` is designed with absolute data safety as its primary constraint. No user data will be altered without a guaranteed recovery path.

## 1. Core Migration Requirements

1. **Zero Data Loss:** Existing context, logs, and parsed graphs must be translated, never discarded.
2. **Automatic Backup:** The engine must zip the legacy `.projectmind/` directory before making any changes.
3. **Rollback Support:** If migration fails midway, the repository is restored to its exact v1.0 state.
4. **Version Compatibility Checks:** The engine must read the v1 schema version to ensure the migration path is valid.

## 2. The Migration Flow

When a user runs `projectmind migrate` inside a v1.0 repository:

### Step 1: Dry-Run Mode (Pre-Flight Check)
The engine executes a simulated migration in memory.
* Checks available disk space in the Global Workspace.
* Validates v1 schema integrity.
* Detects potential database conflicts.
* Outputs a report of what *will* change. (Users can invoke this manually via `projectmind migrate --dry-run`).

### Step 2: Automatic Backup
The engine creates a highly compressed tarball of the local `.projectmind/` folder and saves it to the Global Workspace `backups/migrations/` directory.

### Step 3: Global Allocation
* `RepositoryIdentityManager` generates a UUID.
* `WorkspaceManager` creates the `workspaces/<uuid>/` folder structure.
* The repository is registered in the Global SQLite `registry.db` with a migration status of `IN_PROGRESS`.

### Step 4: Data Translation
* **Context & Logs:** Copied from flat files to the new `IMemoryStore` and `IWorkspaceStore`.
* **Graph DB:** Flat `graph.json` is parsed and ingested into the new KuzuDB `IKnowledgeStore`.

### Step 5: Pointer Finalization
Only after successful translation is the legacy `.projectmind/` folder deleted from the local repository, replaced immediately by the new `.projectmind.json` pointer file. The registry status is updated to `COMPLETED`.

## 3. Failure & Recovery Mechanisms

### 3.1 Rollback
If any error occurs during Step 3 or 4, the `MigrationEngine` triggers a rollback:
1. Deletes the partially created Global Workspace folder.
2. Removes the `IN_PROGRESS` row from the SQLite registry.
3. Leaves the local `.projectmind/` folder completely untouched.

### 3.2 Partial Migration Recovery
If the process is forcefully killed (e.g., power loss) during Step 5:
* The `WorkspaceHealthMonitor` detects an `IN_PROGRESS` state upon next boot.
* The system prompts the user to either resume translation (if the source `.projectmind` still exists) or restore the local repository from the Step 2 automatic backup.

### 3.3 Migration History Logging
Every migration attempt, success, failure, and rollback is permanently logged in the Global Workspace `registry.db` inside the `migrations` table. This allows developers to query:
```sql
SELECT * FROM migrations WHERE status = 'FAILED';
```
This telemetry helps identify edge-case repository structures that break the engine.

## 4. Definition of Done Checklist
- [x] Documented the Dry-Run mode and Version Compatibility checks.
- [x] Defined the automatic backup and rollback constraints.
- [x] Outlined Partial Migration Recovery and Migration History logging.
- [x] Ensured the strategy adheres to the "Zero Data Loss" mandate.
