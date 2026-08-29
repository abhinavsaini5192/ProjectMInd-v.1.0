import { ASTChange, ChangeType } from '../models/RepositoryChange';

export interface GenericASTNode {
  type: string;
  name: string;
  signature: string;
  bodyHash?: string;
}

export class ASTComparator {
  /**
   * Compares two lists of generic AST nodes (e.g., from old and new file versions).
   */
  public compare(oldNodes: GenericASTNode[], newNodes: GenericASTNode[], filePath: string): ASTChange[] {
    const changes: ASTChange[] = [];
    
    const oldMap = new Map(oldNodes.map(n => [n.name, n]));
    const newMap = new Map(newNodes.map(n => [n.name, n]));

    // Check for Added or Modified
    for (const [name, newNode] of newMap.entries()) {
      const oldNode = oldMap.get(name);
      if (!oldNode) {
        changes.push({
          symbolName: name,
          changeType: ChangeType.Added,
          nodeType: newNode.type,
          filePath,
          newSignature: newNode.signature
        });
      } else if (oldNode.signature !== newNode.signature || oldNode.bodyHash !== newNode.bodyHash) {
        changes.push({
          symbolName: name,
          changeType: ChangeType.Modified,
          nodeType: newNode.type,
          filePath,
          previousSignature: oldNode.signature,
          newSignature: newNode.signature
        });
      }
    }

    // Check for Deleted
    for (const [name, oldNode] of oldMap.entries()) {
      if (!newMap.has(name)) {
        changes.push({
          symbolName: name,
          changeType: ChangeType.Deleted,
          nodeType: oldNode.type,
          filePath,
          previousSignature: oldNode.signature
        });
      }
    }

    return changes;
  }
}
