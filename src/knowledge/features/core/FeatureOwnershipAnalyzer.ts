import { FeatureRegistry } from './FeatureRegistry';
import { FeatureOwnership } from '../models/FeatureOwnership';
import { IFeature } from '../models/IFeature';

export class FeatureOwnershipAnalyzer {
  constructor(private registry: FeatureRegistry) {}

  public resolveOwnership(symbolId: string): FeatureOwnership {
    const features = this.registry.getFeaturesForSymbol(symbolId);
    
    if (features.length === 0) {
      return {
        symbolId,
        featureIds: [],
        primaryFeatureId: 'Unknown'
      };
    }

    // Primary feature is the one with highest confidence
    const sorted = [...features].sort((a, b) => b.confidence - a.confidence);

    return {
      symbolId,
      featureIds: features.map(f => f.id),
      primaryFeatureId: sorted[0].id
    };
  }
}
