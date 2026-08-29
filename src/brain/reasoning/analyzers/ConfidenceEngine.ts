import { Hypothesis } from '../models/Hypothesis';

export class ConfidenceEngine {
  public calculateConfidence(hypothesis: Hypothesis): number {
    let score = 0.1; // Base confidence
    
    for (const ev of hypothesis.evidence) {
      score += ev.confidenceContribution;
    }

    // Clamp between 0.0 and 1.0
    return Math.max(0.0, Math.min(1.0, score));
  }
}
