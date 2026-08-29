# Symbol Model Architecture

The `Symbol` is the canonical identity block for any code element in ProjectMind. It completely abstracts away the physical file path in favor of a semantic namespace.

## Interface
```typescript
interface Symbol {
  id: string; // Deterministic sha256 of language+repo+scope+name
  kind: SymbolKind; // Enum (Class, Route, Middleware, etc.)
  name: string;
  language: string;
  repository: string;
  workspace: string;
  owner?: string;
  parentId?: string;
  scope: string; // Fully qualified namespace string
  visibility: 'public' | 'private' | 'protected' | 'internal';
  documentation: string;
  location: SourceLocation;
  version: number;
  hash: string;
  created: number;
  updated: number;
  history: string[];
}
```

This model becomes the core node type persisted into KuzuDB during later Graph generation phases.
