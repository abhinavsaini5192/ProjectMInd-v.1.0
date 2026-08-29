import { describe, it, expect } from 'vitest';
import { DependencyValidator } from '../../../src/intelligence/planning/validation/DependencyValidator';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Plan Dependency Validator & Cycle Detection (Phase 5.5)', () => {
  const validator = new DependencyValidator();

  const basePlan: ActionPlan = {
    planId: 'plan_1',
    decisionId: 'dec_1',
    taskId: 'task_1',
    objective: 'Test plan',
    status: 'DRAFT',
    steps: [
      {
        stepId: 'step_1',
        order: 1,
        type: 'INSPECT',
        description: 'Step 1',
        reason: 'Reason 1',
        target: { type: 'SYMBOL', id: 'sym1' },
        dependencies: [],
        preconditions: [],
        expectedOutcome: 'Done',
        riskLevel: 'LOW',
        validation: [],
        reversibility: 'REVERSIBLE'
      },
      {
        stepId: 'step_2',
        order: 2,
        type: 'MODIFY',
        description: 'Step 2',
        reason: 'Reason 2',
        target: { type: 'SYMBOL', id: 'sym1' },
        dependencies: ['step_1'],
        preconditions: [],
        expectedOutcome: 'Done',
        riskLevel: 'LOW',
        validation: [],
        reversibility: 'REVERSIBLE'
      }
    ],
    dependencies: [
      { stepId: 'step_2', dependsOnStepId: 'step_1', type: 'HARD' }
    ],
    preconditions: [],
    postconditions: [],
    risks: [],
    validationPlan: { validationId: 'v1', steps: [], requiredTests: [], typeCheck: true, architectureCheck: false, dependencyCheck: true },
    affectedResources: ['sym1'],
    estimatedComplexity: 'LOW',
    confidence: 0.9,
    knowledgeVersion: '1.0',
    contextVersion: '1.0',
    reasoningId: 'rsn_1',
    createdAt: Date.now()
  };

  it('should validate an acyclic, valid dependency structure', () => {
    const res = validator.validate(basePlan);
    expect(res.valid).toBe(true);
    expect(res.issues.length).toBe(0);
  });

  it('should detect a circular dependency cycle (Step 1 -> Step 2 -> Step 1)', () => {
    const cyclicPlan: ActionPlan = {
      ...basePlan,
      dependencies: [
        { stepId: 'step_2', dependsOnStepId: 'step_1', type: 'HARD' },
        { stepId: 'step_1', dependsOnStepId: 'step_2', type: 'HARD' }
      ]
    };

    const res = validator.validate(cyclicPlan);
    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('Circular dependency'))).toBe(true);
  });

  it('should reject dependencies referring to non-existent step IDs', () => {
    const brokenPlan: ActionPlan = {
      ...basePlan,
      dependencies: [
        { stepId: 'step_2', dependsOnStepId: 'non_existent_step_99', type: 'HARD' }
      ]
    };

    const res = validator.validate(brokenPlan);
    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('non-existent'))).toBe(true);
  });
});
