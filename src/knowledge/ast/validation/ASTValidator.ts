import { UniversalNode } from '../models/UniversalNode';

export class ASTValidator {
  /**
   * Validates structural integrity: parent/child relationships, duplicate IDs, cycles.
   * Throws an error if invalid, or returns true.
   */
  public validate(root: UniversalNode): boolean {
    const seenIds = new Set<string>();

    const traverse = (node: UniversalNode, expectedParentId?: string) => {
      if (seenIds.has(node.id)) {
        throw new Error(`Cycle or Duplicate ID detected: ${node.id}`);
      }
      seenIds.add(node.id);

      if (expectedParentId && node.parentId !== expectedParentId) {
        throw new Error(`Broken parent reference on node ${node.id}. Expected ${expectedParentId}, got ${node.parentId}`);
      }

      if (node.location.startRow > node.location.endRow) {
        throw new Error(`Invalid location bounds on node ${node.id}`);
      }

      for (const child of node.children) {
        traverse(child, node.id);
      }
    };

    traverse(root);
    return true;
  }
}
