# Parser Architecture (Layer 2.1)

ProjectMind utilizes a highly extensible, plugin-based parser architecture. The architecture isolates language-specific syntax rules away from the ProjectMind core logic.

## Components
- **LanguageDetector**: Scans directories for extensions and manifest files to determine which parsers are needed.
- **LanguageManager**: Manages active languages within a workspace.
- **ParserRegistry**: The central index of loaded `IParser` instances.
- **ParserFactory**: Instantiates the correct parser based on language ID.
- **ParserManager**: Orchestrates parsing commands (e.g. `parseFile`), hooks into the cache, and emits parsing events to the `KernelEventDispatcher`.

## Intermediate AST
Parsers do **not** return raw Tree-sitter AST nodes. They return `IntermediateASTNode`s. This ensures downstream systems (like the Knowledge Graph) remain strictly language-agnostic.
