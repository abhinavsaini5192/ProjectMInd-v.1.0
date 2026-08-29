# Workspace Events Catalog

The Workspace Core publishes strongly typed events to the `IEventBus` using the `WorkspaceEvents` enum.

| Event Name | Fired When | Payload |
| :--- | :--- | :--- |
| `WorkspaceCreated` | A new workspace is provisioned on disk. | `{ repositoryId: string }` |
| `WorkspaceLoaded` | An existing workspace is successfully loaded. | `{ repositoryId: string, path: string, health: HealthReport }` |
| `WorkspaceOpened` | An active session begins against a workspace. | `{ repositoryId: string }` |
| `WorkspaceClosed` | An active session ends. | `{ repositoryId: string }` |
| `RepositoryRegistered` | A UUID is inserted into the global registry. | `{ repository: RepositoryRecord }` |
| `WorkspaceValidated` | Lifecycle transitions to a new state successfully. | `{ repositoryId: string, oldState: WorkspaceStatus, newState: WorkspaceStatus }` |
| `HealthCheckCompleted`| The Health Monitor finishes a diagnostic run. | `{ repositoryId: string, report: HealthReport }` |
