import { FeatureDetector } from './FeatureDetector';
import { FeatureClassifier } from './FeatureClassifier';
import { FeatureBuilder } from './FeatureBuilder';
import { IFeature } from '../models/IFeature';

export class FeatureExtractor {
  constructor(
    private detector: FeatureDetector,
    private classifier: FeatureClassifier,
    private builder: FeatureBuilder
  ) {}

  public extractFeatures(symbolIds: string[], dependencyIds: string[]): IFeature[] {
    const rawFeatures = this.detector.detectFeatures(symbolIds, dependencyIds);
    const features: IFeature[] = [];

    for (const [name, signals] of rawFeatures.entries()) {
      const confidence = this.classifier.classifyConfidence(signals);
      
      // We assume for now that all symbolIds map to this feature.
      // FeatureOwnershipAnalyzer will refine this later.
      const f = this.builder
        .withName(name)
        .withConfidence(confidence)
        .withSignals(signals)
        .withSymbolIds(symbolIds) // MVP simplified mock bind
        .withDependencyIds(dependencyIds)
        .build();

      features.push(f);
    }

    return features;
  }
}
