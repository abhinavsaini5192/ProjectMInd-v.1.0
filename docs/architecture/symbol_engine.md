# Symbol Engine Architecture

The `SymbolEngine` consumes `UniversalNode` elements from the AST layer and elevates them into a fully indexed Symbol Database. 

While the AST Engine understands that `class UserService {}` is a structural "Class" block with location bounds, the **Symbol Engine** understands that it is a public Semantic Identity belonging to `workspace-A` under `repo-1`.

## Pipeline
1. **Extraction**: `SymbolExtractor` (an `IASTVisitor`) walks the AST and creates symbol candidates.
2. **Validation**: `SymbolValidator` ensures metadata integrity (preventing nameless or duplicate identifiers).
3. **Lifecycle**: `SymbolLifecycleManager` compares hashes to detect unchanged, updated, or newly created symbols.
4. **Indexing**: Valid symbols are written into the `SymbolRegistry` (by ID) and the `SymbolIndexer` (by Scope) for O(1) resolution.
