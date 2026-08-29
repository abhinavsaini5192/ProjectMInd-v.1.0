import { IFeature, FeatureSignal } from '../models/IFeature';

export interface IFeatureDetectionStrategy {
  name: string;
  detect(symbolIds: string[], dependencyIds: string[]): Map<string, FeatureSignal[]>;
}

export class FeatureDetector {
  private strategies: IFeatureDetectionStrategy[] = [];

  public registerStrategy(strategy: IFeatureDetectionStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Returns a map of FeatureName -> array of signals supporting it.
   */
  public detectFeatures(symbolIds: string[], dependencyIds: string[]): Map<string, FeatureSignal[]> {
    const featureMap = new Map<string, FeatureSignal[]>();

    for (const strategy of this.strategies) {
      const results = strategy.detect(symbolIds, dependencyIds);
      for (const [featureName, signals] of results.entries()) {
        if (!featureMap.has(featureName)) {
          featureMap.set(featureName, []);
        }
        featureMap.get(featureName)!.push(...signals);
      }
    }

    return featureMap;
  }
}
