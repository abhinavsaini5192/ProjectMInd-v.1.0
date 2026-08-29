import { ReasoningResult } from '../models/ReasoningResult';

export class ConfidenceValidator {
  public validate(result: Partial<ReasoningResult>): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Flag high confidence when no evidence or observations exist
    const hasEvidence = (result.evidence && result.evidence.length > 0) || (result.observations && result.observations.length > 0);
    if ((result.confidence ?? 0) > 0.85 && !hasEvidence) {
      issues.push(`Overconfident assertion (confidence: ${result.confidence}) without supporting evidence or observations`);
    }

    // If marked NEEDS_MORE_INFORMATION, confidence should not be high
    if (result.decision?.status === 'NEEDS_MORE_INFORMATION' && (result.confidence ?? 0) > 0.7) {
      issues.push('Confidence is inconsistently high for a decision marked NEEDS_MORE_INFORMATION');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
