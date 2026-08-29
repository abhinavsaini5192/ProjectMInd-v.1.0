export class DecisionThresholdEngine {
  public evaluate(confidence: number): 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_CONFIDENCE' {
    if (confidence >= 0.90) return 'HIGH_CONFIDENCE';
    if (confidence >= 0.70) return 'MODERATE_CONFIDENCE';
    if (confidence >= 0.50) return 'LOW_CONFIDENCE';
    return 'INSUFFICIENT_CONFIDENCE';
  }
}
