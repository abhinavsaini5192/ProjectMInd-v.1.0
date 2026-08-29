# Global Workspace Filesystem Architecture

The Global Workspace Filesystem manages all physical disk operations for ProjectMind v2.0. To prevent repository pollution, ProjectMind no longer stores databases, caches, or logs inside the user's local repository. Instead, it maintains a Global Workspace structure typically located in the OS AppData directory.

## Core Managers

- **WorkspaceDirectoryManager**: Enforces rigid folder structures (`config/`, `registry/`, `workspaces/`).
- **WorkspaceFileManager**: Provides atomic file operations to prevent corruption during unexpected terminations.
- **WorkspacePointerManager**: Handles the `.projectmind.json` file, which is the ONLY file ProjectMind leaves in the user's repository.
- **WorkspaceLockManager**: Provides inter-process concurrency control using time-bound `.lock` files.
- **WorkspaceTemplateManager**: Dynamically creates JSON skeletons for metadata, configs, and readmes.
- **WorkspaceCleanupManager**: Safely collects garbage (like temporary files and stale locks).
- **WorkspacePermissions**: Performs OS-level R/W/X validation.

The primary entry point is the `WorkspaceFilesystem` Facade injected via the DI Container.
