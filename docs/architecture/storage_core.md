# Storage Core Framework

The Storage Core is the orchestration layer sitting directly beneath the Workspace API and above the actual database implementations (like SQLite, KuzuDB). It guarantees that ProjectMind remains completely storage-agnostic.

## Key Components

- **`StorageManager`**: The primary facade for initializing and managing storage.
- **`StorageFactory`**: Resolves specific storage providers using Dependency Injection, preventing hard-coded imports.
- **`StorageProviderRegistry`**: Safely tracks and prevents duplicate registrations of Storage Providers.
- **`StorageLifecycleManager`**: Ensures that every provider follows a strict initialization and shutdown sequence, emitting events at every step.
- **`StorageValidator`**: Verifies that incoming providers conform to required name, type, and configuration constraints.

## Architecture Flow

When a runtime module requests a specific database (e.g., the Registry):
1. The module requests `IStorageFactory` from the DI Container.
2. It calls `factory.getProviderByType(StorageProviderType.Registry)`.
3. The Factory consults the `StorageProviderRegistry`.
4. The Registry returns the registered provider (e.g., `SqliteRegistryProvider`).
5. The module uses the provider without ever knowing it's SQLite.

This ensures zero vendor lock-in.
