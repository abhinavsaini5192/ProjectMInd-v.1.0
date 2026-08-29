# AST Visitor Guide

To extract symbols or relationships, do NOT walk the AST manually. Use the `ASTTraverser` and the `IASTVisitor` pattern.

## Implementation Example
```typescript
class MySymbolExtractor implements IASTVisitor {
  visit(node: UniversalNode): void {
    if (node.kind === NodeKind.Class) {
      console.log(`Found a class named ${node.name}`);
    }
  }
}

const traverser = new ASTTraverser();
traverser.traverse(universalAst, [new MySymbolExtractor()]);
```
