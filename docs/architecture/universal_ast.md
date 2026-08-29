# Universal AST Architecture

The `UniversalASTEngine` serves as the structural source of truth for the entire ProjectMind intelligence layer. 

By taking the intermediate trees from the `LanguageFramework` and mapping them into standardized `UniversalNode` trees, it guarantees that AI extraction layers do not need to care whether they are looking at Python, Rust, or C#.

## Key Features
- **Cache & Versioning**: Unchanged files are instantly retrieved via SHA-256 hashes instead of being re-normalized.
- **Validation**: ASTs are guaranteed to be acyclic with valid source mappings.
- **Serialization**: Can be exported/imported instantly via JSON.
