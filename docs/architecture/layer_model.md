# Layer Resolution Pipeline

The `LayerAnalyzer` is powered by a `LayerResolutionPipeline` that prevents rigid coupling to folder names.

Resolution follows a strict priority:
1. **Explicit Config**: Developer-defined mapping (e.g. `User = DomainLayer`)
2. **Framework Detection**: Resolving `React.Component` automatically to `Presentation`
3. **Convention Rules**: Fallback to folder names (`/src/db` = `Infrastructure`)
4. **Graph Heuristics**: E.g. If a module has zero efferent coupling but high afferent, it's likely a leaf Domain object.

This layered approach guarantees the analyzer works in massive legacy monoliths and brand-new microservices alike.
