import { FeatureSignal } from '../models/IFeature';

export class FeatureClassifier {
  /**
   * Calculates an aggregated confidence score between 0.0 and 1.0 based on signals.
   */
  public classifyConfidence(signals: FeatureSignal[]): number {
    if (signals.length === 0) return 0.0;
    
    // Simplistic sum clamped to 1.0. Real implementation could use logistic regression.
    let totalWeight = 0;
    for (const sig of signals) {
      totalWeight += sig.weight;
    }
    
    return Math.min(totalWeight, 1.0);
  }
}
