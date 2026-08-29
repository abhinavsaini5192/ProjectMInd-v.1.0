# Symbol Index Architecture

Lookups are heavily optimized via an in-memory two-tier system:

## 1. SymbolRegistry (O(1) ID Lookup)
A flat key-value store mapping `Symbol.id` directly to the `Symbol` object. Used when establishing rigid Edge relationships.

## 2. SymbolIndexer (O(1) Scope Lookup)
A reverse-index mapping `Scope` strings to arrays of `Symbol.id`s. Used when resolving imports (e.g. `import { Foo } from 'bar'` -> Look up scope `bar`).
