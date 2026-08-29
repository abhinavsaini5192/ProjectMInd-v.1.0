import { LearningCandidate } from '../models/LearningCandidate';

export class LearningRejectionPolicy {
  public shouldReject(candidate: LearningCandidate): { reject: boolean; reason?: string } {
    if (candidate.temporalType === 'EXPIRING' && candidate.expiresAt && Date.now() > candidate.expiresAt) {
      return { reject: true, reason: 'Learning candidate has expired' };
    }
    if (candidate.confidence === 'VERY_LOW' || candidate.confidenceScore < 0.4) {
      return { reject: true, reason: 'Confidence score is below acceptance threshold' };
    }
    return { reject: false };
  }
}
