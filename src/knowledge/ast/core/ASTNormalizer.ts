import { IntermediateASTNode } from '../../parsers/models/LanguageCapabilities';
import { UniversalNode } from '../models/UniversalNode';
import { NodeMapper } from './NodeMapper';
import { NodeFactory } from './NodeFactory';
import { NodeKind } from '../models/NodeKind';

export class ASTNormalizer {
  constructor(private mapper: NodeMapper, private factory: NodeFactory) {}

  public normalize(intermediate: IntermediateASTNode, language: string, filePath: string): UniversalNode {
    return this.walk(intermediate, language, filePath, undefined);
  }

  private walk(node: IntermediateASTNode, language: string, filePath: string, parent?: UniversalNode): UniversalNode {
    let kind = this.mapper.mapKind(language, node.type);
    
    // Python structural context correction
    if (language === 'python' && kind === NodeKind.Function && parent?.kind === NodeKind.Class) {
      kind = NodeKind.Method;
    }

    const universal = this.factory.createNode(
      kind,
      language,
      {
        startRow: node.startPosition.row,
        startColumn: node.startPosition.column,
        endRow: node.endPosition.row,
        endColumn: node.endPosition.column,
        filePath
      },
      node.name,
      node.rawText
    );

    if (parent) {
      universal.parentId = parent.id;
    }

    for (const child of node.children) {
      const uChild = this.walk(child, language, filePath, universal);
      universal.children.push(uChild);
    }

    return universal;
  }
}
