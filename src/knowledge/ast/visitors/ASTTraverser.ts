import { UniversalNode } from '../models/UniversalNode';

export interface IASTVisitor {
  visit(node: UniversalNode): void;
}

export class ASTTraverser {
  /**
   * Traverses the AST in Depth-First Search (DFS) order, invoking all provided visitors.
   */
  public traverse(root: UniversalNode, visitors: IASTVisitor[]): void {
    for (const visitor of visitors) {
      visitor.visit(root);
    }
    for (const child of root.children) {
      this.traverse(child, visitors);
    }
  }
}
