import { describe, it, expect } from 'vitest';
import { PlanBuilder } from '../../../src/intelligence/planning/core/PlanBuilder';

describe('Plan Builder (Phase 5.5)', () => {
  it('should construct sequential steps and wire dependencies correctly', () => {
    const builder = new PlanBuilder('test_plan');
    builder
      .addStep({
        type: 'INSPECT',
        description: 'Inspect session config',
        reason: 'Understand timeout settings',
        target: { type: 'SYMBOL', id: 'AuthService' }
      })
      .addStep({
        type: 'MODIFY',
        description: 'Update timeout value',
        reason: 'Fix timeout',
        target: { type: 'SYMBOL', id: 'AuthService' },
        dependsOnPrevious: true,
        riskLevel: 'MEDIUM'
      });

    const { steps, dependencies } = builder.build();

    expect(steps.length).toBe(2);
    expect(steps[0]!.stepId).toBe('test_plan_1');
    expect(steps[1]!.stepId).toBe('test_plan_2');
    expect(steps[1]!.dependencies).toContain('test_plan_1');
    expect(dependencies.length).toBe(1);
    expect(dependencies[0]!.stepId).toBe('test_plan_2');
    expect(dependencies[0]!.dependsOnStepId).toBe('test_plan_1');
  });
});
