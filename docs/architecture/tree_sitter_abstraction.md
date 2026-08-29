# Tree-sitter Abstraction

ProjectMind utilizes Tree-sitter for robust parsing, but strictly isolates it behind the `TreeSitterAdapter`.

## Why?
- **Future-proofing**: If we move away from Tree-sitter to a faster or more supported engine, no core ProjectMind logic needs to change.
- **Standardization**: Tree-sitter ASTs vary wildly between languages (e.g., Python `function_definition` vs TS `function_declaration`). The Adapter normalizes these into the `IntermediateASTNode`.

## Usage
Only `IParser` plugins may import `TreeSitterAdapter`.
Never expose a `TreeSitterAdapter` to the Intelligence or Graph layers.
