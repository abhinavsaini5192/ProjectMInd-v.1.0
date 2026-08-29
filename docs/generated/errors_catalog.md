# Workspace Errors Catalog

All errors thrown by the Workspace Core inherit from `ProjectMindError`, ensuring a unified capture and telemetry experience.

## Error Hierarchy

```text
ProjectMindError
├── WorkspaceError (ERR_WORKSPACE)
│   ├── RegistryError (ERR_REGISTRY)
│   ├── StorageError (ERR_STORAGE)
│   ├── ConfigurationError (ERR_CONFIGURATION)
│   ├── LifecycleError (ERR_LIFECYCLE)
│   └── ValidationError (ERR_VALIDATION)
└── DIError (ERR_DEPENDENCY_INJECTION)
```

## Description
* **`RegistryError`**: Thrown during duplicate UUID registrations or when the SQLite registry is unreachable.
* **`StorageError`**: Thrown when disk space is exhausted, permissions are denied, or files are not found by the `IWorkspaceStore`.
* **`LifecycleError`**: Thrown when attempting an invalid state machine transition (e.g., Uninitialized -> Updating).
* **`DIError`**: Thrown when a circular dependency is detected during startup or an unregistered token is resolved.
