# Memory Lifecycle

## Deduplication
When a new memory candidate is validated, the `MemoryDeduplicator` checks if an equivalent fact already exists. If it does, the system merges the evidence and bumps the `observationCount`, rather than duplicating the record. Repeated observations organically increase confidence.

## Contradiction & Supersession
When a new candidate derived from an authoritative source (like live `SOURCE_CODE`) contradicts an old memory, the old memory's status is changed to `SUPERSEDED`. 

**Invariant**: We never silently delete historical facts; they are maintained in an `ARCHIVED` or `SUPERSEDED` state for auditability.
