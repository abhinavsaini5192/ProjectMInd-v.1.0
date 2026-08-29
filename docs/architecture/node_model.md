# Node Model Architecture

The `UniversalNode` is the atom of the ProjectMind structural system.

## Interface
```typescript
interface UniversalNode {
  id: string; // UUID
  kind: NodeKind; // Standardized enum (e.g. NodeKind.Class)
  language: string; // Original source language for heuristics
  name?: string;
  location: SourceLocation;
  parentId?: string;
  children: UniversalNode[];
  attributes: Record<string, any>;
  metadata: Record<string, any>;
  version: number;
  hash: string;
  parserVersion: string;
  rawText?: string;
}
```

This model is deliberately completely uncoupled from the native C/WASM `tree-sitter` nodes.
