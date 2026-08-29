# Filesystem Runtime Flow

The `WorkspaceBootstrap` module handles the initialization sequence when ProjectMind starts up.

1. **Global Init**: It calls `initializeGlobalWorkspace`, checking the OS AppData path. It uses `WorkspaceDirectoryManager.createStructure` to ensure the global layout exists.
2. **Repo Discovery**: When a repository is mounted, the system looks for a `.projectmind.json` pointer file.
3. **Repo Init**: If missing, `initializeRepositoryWorkspace` is called. It creates a new UUID, spins up the Repository Workspace inside the global `workspaces/` directory, and writes the lightweight pointer file back to the original repository.
4. **Event Emission**: Through the entire process, events like `WorkspaceCreated` and `PointerCreated` are emitted via `IEventBus`.
