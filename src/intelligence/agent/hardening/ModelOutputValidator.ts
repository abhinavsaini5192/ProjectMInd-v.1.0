import { ModelOutputValidationError } from '../errors/ModelOutputValidationError';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ModelOutputValidator {
  /**
   * Validate reasoning output from model
   */
  public static validateReasoningOutput(output: any, strict: boolean = true): ValidationResult {
    const errors: string[] = [];

    if (!output || typeof output !== 'object') {
      errors.push('Reasoning output must be a non-null object');
    } else {
      if (!output.decision) {
        errors.push('Reasoning output missing required "decision" field');
      } else if (!output.decision.type) {
        errors.push('Reasoning decision missing required "type" field');
      }

      if (typeof output.confidence !== 'number' || output.confidence < 0 || output.confidence > 1) {
        errors.push('Reasoning output missing valid "confidence" number between 0 and 1');
      }

      if (!Array.isArray(output.reasoningSteps) && !Array.isArray(output.steps)) {
        errors.push('Reasoning output missing steps array');
      }
    }

    const valid = errors.length === 0;
    if (!valid && strict) {
      throw new ModelOutputValidationError(
        `Model reasoning output failed schema validation: ${errors.join('; ')}`,
        JSON.stringify(output),
        errors
      );
    }

    return { valid, errors };
  }

  /**
   * Validate plan output from model
   */
  public static validatePlanOutput(output: any, strict: boolean = true): ValidationResult {
    const errors: string[] = [];

    if (!output || typeof output !== 'object') {
      errors.push('Plan output must be a non-null object');
    } else {
      if (!output.objective || typeof output.objective !== 'string') {
        errors.push('Plan output missing required "objective" string');
      }

      if (!Array.isArray(output.steps) || output.steps.length === 0) {
        errors.push('Plan output must contain a non-empty "steps" array');
      } else {
        for (let i = 0; i < output.steps.length; i++) {
          const step = output.steps[i];
          if (!step.stepId || !step.action) {
            errors.push(`Plan step[${i}] missing required "stepId" or "action"`);
          }
        }
      }
    }

    const valid = errors.length === 0;
    if (!valid && strict) {
      throw new ModelOutputValidationError(
        `Model plan output failed schema validation: ${errors.join('; ')}`,
        JSON.stringify(output),
        errors
      );
    }

    return { valid, errors };
  }
}
