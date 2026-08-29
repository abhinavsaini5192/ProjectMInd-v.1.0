import { LearningCandidate } from '../models/LearningCandidate';

export class LearningPromoter {
  public evaluatePromotion(candidate: LearningCandidate): LearningCandidate {
    // Progression: OBSERVATION -> CANDIDATE -> CONFIRMED -> PROMOTED
    if (candidate.confidenceScore >= 0.85 && candidate.evidence.length >= 1) {
      return {
        ...candidate,
        promotionStatus: 'PROMOTED'
      };
    } else if (candidate.confidenceScore >= 0.7) {
      return {
        ...candidate,
        promotionStatus: 'CONFIRMED'
      };
    } else if (candidate.confidenceScore >= 0.5) {
      return {
        ...candidate,
        promotionStatus: 'CANDIDATE'
      };
    } else {
      return {
        ...candidate,
        promotionStatus: 'OBSERVATION'
      };
    }
  }
}
