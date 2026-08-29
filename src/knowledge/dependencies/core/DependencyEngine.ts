import { DependencyRegistry } from './DependencyRegistry';
import { DependencyExtractor } from './DependencyExtractor';
import { DependencyResolver } from './DependencyResolver';
import { DependencyGraphBuilder } from './DependencyGraphBuilder';
import { ArchitectureAnalyzer } from './ArchitectureAnalyzer'; // We'll wrap Rule Engine here
import { DependencyValidator } from '../validation/DependencyValidator';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { Relationship } from '../../relationships/models/Relationship';

export class DependencyEngine {
  constructor(
    private registry: DependencyRegistry,
    private extractor: DependencyExtractor,
    private resolver: DependencyResolver,
    private builder: DependencyGraphBuilder,
    private architectureAnalyzer: ArchitectureAnalyzer,
    private validator: DependencyValidator,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processRelationships(relationships: Relationship[]): void {
    const candidates = relationships.map(r => this.extractor.extractFromRelationship(r));
    
    this.validator.validate(candidates);

    for (const dep of candidates) {
      this.registry.registerDependency(dep);
      this.dispatcher.publish('DependencyCreated', { id: dep.id });
    }

    // Run architectural evaluation on the newly updated registry state
    const violations = this.architectureAnalyzer.analyze(this.registry);
    for (const v of violations) {
      this.dispatcher.publish('ArchitectureViolationDetected', v);
    }
  }

  public getResolver(): DependencyResolver {
    return this.resolver;
  }
}
