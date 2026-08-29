import { FeatureRegistry } from './FeatureRegistry';
import { FeatureExtractor } from './FeatureExtractor';
import { FeatureResolver } from './FeatureResolver';
import { FeatureBoundaryAnalyzer } from './FeatureBoundaryAnalyzer';
import { FeatureOwnershipAnalyzer } from './FeatureOwnershipAnalyzer';
import { FeatureValidator } from '../validation/FeatureValidator';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { FEATURE_CREATED, FEATURE_VALIDATED } from '../types/FeatureEvents';

export class FeatureEngine {
  constructor(
    private registry: FeatureRegistry,
    private extractor: FeatureExtractor,
    private resolver: FeatureResolver,
    private boundaryAnalyzer: FeatureBoundaryAnalyzer,
    private ownershipAnalyzer: FeatureOwnershipAnalyzer,
    private validator: FeatureValidator,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processSemanticGraph(symbolIds: string[], dependencyIds: string[]): void {
    const candidates = this.extractor.extractFeatures(symbolIds, dependencyIds);
    
    this.validator.validate(candidates);
    this.dispatcher.publish(FEATURE_VALIDATED, { count: candidates.length });

    for (const f of candidates) {
      this.registry.register(f);
      this.dispatcher.publish(FEATURE_CREATED, { id: f.id, name: f.name });
    }
  }

  public getResolver(): FeatureResolver { return this.resolver; }
  public getBoundaryAnalyzer(): FeatureBoundaryAnalyzer { return this.boundaryAnalyzer; }
  public getOwnershipAnalyzer(): FeatureOwnershipAnalyzer { return this.ownershipAnalyzer; }
}
