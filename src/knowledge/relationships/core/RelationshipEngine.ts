import { UniversalNode } from '../../ast/models/UniversalNode';
import { ASTTraverser } from '../../ast/visitors/ASTTraverser';
import { RelationshipExtractor } from '../extraction/RelationshipExtractor';
import { RelationshipRegistry } from '../extraction/RelationshipRegistry';
import { RelationshipResolver } from '../extraction/RelationshipResolver';
import { RelationshipLifecycleManager } from './RelationshipLifecycleManager';
import { RelationshipValidator } from '../validation/RelationshipValidator';

export class RelationshipEngine {
  constructor(
    private traverser: ASTTraverser,
    private extractor: RelationshipExtractor,
    private registry: RelationshipRegistry,
    private resolver: RelationshipResolver,
    private lifecycle: RelationshipLifecycleManager,
    private validator: RelationshipValidator
  ) {}

  /**
   * Translates the AST structural paths into formal semantic Edge Relationships
   * using the attached Extractor rules.
   */
  public processAST(universalAst: UniversalNode): void {
    this.extractor.extractedRelationships = [];
    this.traverser.traverse(universalAst, [this.extractor]);

    const candidates = this.extractor.extractedRelationships;
    this.validator.validate(candidates);

    for (const candidate of candidates) {
      const existing = this.resolver.resolveById(candidate.id);
      const evolvedRel = this.lifecycle.processEvolution(existing, candidate);
      this.registry.register(evolvedRel);
    }
  }

  public getResolver(): RelationshipResolver {
    return this.resolver;
  }
}
