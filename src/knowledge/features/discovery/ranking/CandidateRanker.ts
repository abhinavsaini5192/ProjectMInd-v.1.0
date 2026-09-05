import type { FeatureCandidate } from '../models/FeatureCandidate';

export class CandidateRanker {
  /**
   * Sort candidates by score descending, breaking ties by evidence count and confidence level
   */
  public rank(candidates: FeatureCandidate[]): FeatureCandidate[] {
    const confidenceOrder: Record<string, number> = {
      VERY_HIGH: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      VERY_LOW: 1,
    };

    return [...candidates].sort((a, b) => {
      // Primary: Score
      if (Math.abs(b.score - a.score) > 0.001) {
        return b.score - a.score;
      }
      // Secondary: Confidence Level
      const confA = confidenceOrder[a.confidence.level] || 0;
      const confB = confidenceOrder[b.confidence.level] || 0;
      if (confB !== confA) {
        return confB - confA;
      }
      // Tertiary: Evidence count
      return b.evidence.length - a.evidence.length;
    });
  }
}
