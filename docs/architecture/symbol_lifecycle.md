# Symbol Lifecycle Architecture

To prevent aggressive rebuilding of the Graph database, the Symbol Engine implements strict incremental lifecycle tracking.

## Detection Rules
1. **Unchanged**: If a file is re-parsed, but the `SymbolVersionManager` detects that the structural `hash` of the symbol is identical to the known registry hash, it silently skips updating the symbol.
2. **Updated**: If the `hash` has changed, the symbol's `version` increments, `updated` timestamp is refreshed, and a `Symbol:Updated` event is emitted.
3. **Created**: If the `id` (generated via Language+Repo+Scope+Name) is not found in the registry, a `Symbol:Created` event is emitted.

This guarantees downstream Graph updating (Phase L2.4) only runs when strictly necessary.
