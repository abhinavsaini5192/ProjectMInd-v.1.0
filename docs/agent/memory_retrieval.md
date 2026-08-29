# Memory Retrieval

The `MemoryQueryEngine` interfaces with an abstract `IMemoryStore`. It allows querying by specific tasks, features, or architectural symbols.

When memories are retrieved, they are sorted by the `MemoryRanker`. The ranking algorithm prioritizes:
1. High `confidence`
2. High `observationCount`
3. Recency (`lastConfirmedAt`)

SLMs are not used for this foundational sorting process, keeping retrieval lightning fast and deterministic.
