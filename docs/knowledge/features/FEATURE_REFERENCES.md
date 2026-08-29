# Feature References & Roles

`FeatureReference` connects a high-level Feature to underlying technical resources in the Knowledge Graph.

## Supported Resource Types
- `FILE`, `SYMBOL`, `MODULE`, `PACKAGE`, `DEPENDENCY`, `RELATIONSHIP`, `CONFIGURATION`, `TEST`, `DATABASE`, `ENDPOINT`, `COMMAND`, `UI_COMPONENT`

## Reference Roles
- `ENTRY_POINT`, `IMPLEMENTATION`, `SUPPORT`, `DEPENDENCY`, `CONFIGURATION`, `STORAGE`, `TEST`, `UI`, `API`, `DOCUMENTATION`, `VERIFICATION`, `OBSERVABILITY`

## Non-Destructive Invariant
Adding or removing a `FeatureReference` only alters the feature-to-resource mapping; it never modifies or deletes the underlying physical source file or AST symbol.
