# Repair Policy

ProjectMind's Validation Engine explicitly distinguishes between Safe and Unsafe repairs.

**Safe Repairs** (Permitted):
- Flushing stale query caches
- Rebuilding transient indexes

**Unsafe Repairs** (Explicitly Blocked):
- Mutating Source AST
- Deleting Symbols
- Merging Features
- Rewriting Git Evolution

Attempting unsafe repairs will throw `UnsafeRepairBlockedError`.
