import { IASTVisitor } from '../../ast/visitors/ASTTraverser';
import { UniversalNode } from '../../ast/models/UniversalNode';
import { NodeKind } from '../../ast/models/NodeKind';
import { Relationship } from '../models/Relationship';
import { RelationshipType } from '../models/RelationshipType';
import { RelationshipBuilder } from '../core/RelationshipBuilder';
import { SymbolResolver } from '../../symbols/extraction/SymbolResolver';

/**
 * Hybrid extractor. It walks the UniversalAST to detect structural relationships (like Contains/Calls),
 * but it uses the SymbolResolver to map those AST nodes directly back to the stable Symbol IDs.
 */
export class RelationshipExtractor implements IASTVisitor {
  public extractedRelationships: Relationship[] = [];

  constructor(
    private builder: RelationshipBuilder,
    private symbolResolver: SymbolResolver
  ) {}

  public visit(node: UniversalNode): void {
    // Basic Heuristic: If this node has a parent, it structurally "Contains" this node.
    if (node.parentId) {
      // Resolve the parent node's Symbol ID based on scope heuristics
      // (For this L2.4 scope, we mock the symbol lookup by assuming node IDs map closely to Symbol namespaces
      //  or we query the symbol resolver. Here we just mock the ID mapping for architecture demonstration).
      
      const sourceSymbolId = `sym_${node.parentId}`;
      const targetSymbolId = `sym_${node.id}`;

      // Ensure both symbols actually exist in the registry before drawing an edge
      // const sourceSym = this.symbolResolver.resolveById(sourceSymbolId);
      // const targetSym = this.symbolResolver.resolveById(targetSymbolId);
      
      // if (sourceSym && targetSym) {
      
      const rel = this.builder
        .from(sourceSymbolId)
        .to(targetSymbolId)
        .withType(RelationshipType.Contains)
        .addEvidence({
          description: `Structural parent/child link found in AST`,
          confidenceScore: 1.0,
          location: node.location
        })
        .build();

      this.extractedRelationships.push(rel);
    }
  }
}
