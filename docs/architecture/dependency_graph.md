# Dependency Graph Engine

The graph is formed by `DependencyChain` objects.

A simple `SymbolA -> SymbolB` relation from L2.4 is processed by the `DependencyGraphBuilder`, tracing its ultimate destination.

If `AuthService -> TokenBuilder -> EnvSecret`, the builder extracts the full chain.

This powers massive Query APIs later in L2.8, allowing AI agents to query:
- `FindCriticalPaths()`
- `FindDependents()`
- `FindDependencies()`
- `FindHighRiskModules()`

Because it's a DAG (Directed Acyclic Graph), we track Centrality and Change Impact scores deterministically.
