# Query Caching

Queries are hashed into a deterministic cache key comprising:
- Repository ID
- Entity & Operation
- Filters
- Included aggregates
- Snapshot ID
- Knowledge Version

To prevent stale data, the `QueryInvalidator` hooks into the `KernelEventDispatcher`. When the core knowledge layer emits an event (e.g. `Feature:Updated`), the invalidator intelligently flushes only the relevant entities in the cache.
