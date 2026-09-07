# Call Chain Analysis

## Overview

Call chain analysis traces sequential invocations between functions, methods, and architectural tiers to reconstruct the spine of execution.

---

## Architectural Tier Progression

ProjectMind enforces an architectural ordering model when stitching call chains:

```
[ENTRY_POINT]
     ↓
[VALIDATION] / [AUTHORIZATION]
     ↓
[CONTROLLER] / [HANDLER]
     ↓
[SERVICE]
     ↓
[REPOSITORY]
     ↓
[DATABASE] / [CACHE] / [EXTERNAL_SERVICE]
     ↓
[RESPONSE] / [EXIT]
```

---

## Edge Types in Call Chains

- **`CALLS`**: Synchronous direct function or method invocation.
- **`AWAIT`**: Asynchronous promise resolution within the call chain.
- **`READS`**: Retrieving state from repositories or cache.
- **`WRITES`**: Mutating persistent storage.
- **`RETURNS`**: Returning response or output to the caller.

---

## Provenance

Call chains are backed by `CallChainSource` evidence referencing caller and callee symbols extracted from AST knowledge in Layer 1.
