import { LearningCandidate } from '../models/LearningCandidate';

export class LearningValidator {
  public validate(candidate: LearningCandidate): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!candidate.candidateId) issues.push('Missing candidateId');
    if (!candidate.content || candidate.content.trim().length === 0) {
      issues.push('LearningCandidate content cannot be empty');
    }
    if (!candidate.evidence || candidate.evidence.length === 0) {
      issues.push('LearningCandidate must be supported by at least one evidence item');
    }
    if (candidate.confidenceScore < 0.3) {
      issues.push(`Confidence score too low (${candidate.confidenceScore}) for learning`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
