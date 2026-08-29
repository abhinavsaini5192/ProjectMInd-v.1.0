# Workspace Services

The Workspace Core exposes domain-specific services through the `WorkspaceAPI` facade.

## 1. RegistryService
Manages the global SQLite registry.
* `register(repo: RepositoryRecord)`
* `getRepository(id: string)`
* `listAll()`

## 2. WorkspaceService
Orchestrates high-level workspace operations.
* `initialize(repositoryId: string, repositoryPath: string)`
* `load(repositoryId: string)`
* `locateByPath(localPath: string)`

## 3. ConfigurationService
Provides typed access to the merged configuration hierarchy.
* `get(key: keyof WorkspaceConfig)`
* `applyWorkspaceOverrides(overrides)`

## 4. HealthService
Runs diagnostics on the workspace infrastructure.
* `checkHealth(repositoryId?: string): Promise<HealthReport>`

## 5. LifecycleService
Manages state transitions securely.
* `transition(repositoryId: string, current: WorkspaceStatus, next: WorkspaceStatus)`
