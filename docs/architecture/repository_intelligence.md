# Repository Intelligence Engine Architecture

The Repository Intelligence Engine provides deterministic semantic analysis over raw repository changes. It prevents the system from relying on expensive or hallucinating LLM calls to understand *what* happened in a repository.

## The Pipeline
1. **RepositoryScanner & DiffEngine**: Identify raw text changes and simulated AST node structures.
2. **ASTComparator**: Diff two generic abstract syntax trees to identify `Added`, `Modified`, or `Deleted` nodes.
3. **Detectors**: A suite of deterministic classes that classify changes:
   - `FeatureDetector`
   - `BreakingChangeDetector`
   - `RefactorDetector`
   - `DependencyAnalyzer`
4. **SemanticEventEngine**: Collates detector outputs into standard `SemanticEvent` models (`FeatureAdded`, `Refactored`, `BreakingChange`).
5. **UpdatePlanners**: Interacts with the `ImpactAnalyzer` (and downstream `GraphTraversalEngine`) to identify exactly what Knowledge Graph nodes or Memory Context blocks must be invalidated.
