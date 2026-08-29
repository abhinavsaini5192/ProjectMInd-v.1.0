# Storage Events Catalog

The Storage Core publishes strongly typed events to the `IEventBus` via the `StorageEvents` enum.

| Event Name | Fired When | Payload |
| :--- | :--- | :--- |
| `storage.initializing` | A provider begins its initialization sequence. | `{ providerName: string }` |
| `storage.initialized` | A provider successfully initializes its connections. | `{ providerName: string }` |
| `storage.started` | A provider is ready to accept read/write requests. | `{ providerName: string }` |
| `storage.stopped` | A provider halts operations gracefully. | `{ providerName: string }` |
| `provider.registered` | A new provider is successfully validated and registered. | `{ providerName: string, type: StorageProviderType }` |
| `storage.disposed` | A provider completely frees its resources. | `{ providerName: string }` |
