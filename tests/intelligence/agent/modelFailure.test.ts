import { describe, it, expect } from 'vitest';
import { ModelOutputValidator } from '../../../src/intelligence/agent/hardening/ModelOutputValidator';
import { ModelOutputValidationError } from '../../../src/intelligence/agent/errors/ModelOutputValidationError';
import { FailureTaxonomy } from '../../../src/intelligence/agent/taxonomy/FailureTaxonomy';

describe('ProjectMindAgent: Model Failure & Validation', () => {
  it('should validate well-formed reasoning output', () => {
    const validReasoning = {
      decision: { type: 'PROCEED' },
      confidence: 0.9,
      reasoningSteps: [{ statement: 'All checks passed' }],
    };

    const res = ModelOutputValidator.validateReasoningOutput(validReasoning, false);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('should reject malformed reasoning output and throw ModelOutputValidationError in strict mode', () => {
    const invalidReasoning = {
      confidence: 'not-a-number',
      // missing decision and steps
    };

    expect(() => ModelOutputValidator.validateReasoningOutput(invalidReasoning, true)).toThrow(
      ModelOutputValidationError
    );

    const nonStrictRes = ModelOutputValidator.validateReasoningOutput(invalidReasoning, false);
    expect(nonStrictRes.valid).toBe(false);
    expect(nonStrictRes.errors.length).toBeGreaterThan(0);
  });

  it('should validate well-formed plan output', () => {
    const validPlan = {
      objective: 'Refactor database models',
      steps: [{ stepId: 'step_1', action: 'CREATE_FILE' }],
    };

    const res = ModelOutputValidator.validatePlanOutput(validPlan, false);
    expect(res.valid).toBe(true);
  });

  it('should reject invalid plan output missing steps or objective', () => {
    const invalidPlan = {
      steps: [], // empty steps
    };

    expect(() => ModelOutputValidator.validatePlanOutput(invalidPlan, true)).toThrow(
      ModelOutputValidationError
    );
  });

  it('should classify model validation errors and recommend FALLBACK_MODEL', () => {
    const err = new ModelOutputValidationError('JSON parse error from SLM', 'invalid json');
    const record = FailureTaxonomy.classify(err, 'SLMRuntime');

    expect(record.category).toBe('MODEL_ERROR');
    expect(record.recoveryAction).toBe('FALLBACK_MODEL');
    expect(record.fatal).toBe(false);
  });
});
