import { ReasoningResult } from '../models/ReasoningResult';

export class SchemaValidator {
  public validate(result: Partial<ReasoningResult>): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!result.reasoningId) issues.push('Missing reasoningId');
    if (!result.taskId) issues.push('Missing taskId');
    if (!result.modelId) issues.push('Missing modelId');
    if (!result.contextPackageId) issues.push('Missing contextPackageId');

    if (result.confidence !== undefined) {
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        issues.push(`Invalid confidence score: ${result.confidence}. Must be between 0.0 and 1.0`);
      }
    } else {
      issues.push('Missing overall confidence score');
    }

    if (!result.decision) {
      issues.push('Missing reasoning decision');
    } else if (!result.decision.status) {
      issues.push('Missing decision status');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
