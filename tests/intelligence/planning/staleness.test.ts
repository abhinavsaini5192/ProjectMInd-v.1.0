import { describe, it, expect } from 'vitest';
import { PlanValidator } from '../../../src/intelligence/planning/validation/PlanValidator';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Plan Staleness & Invalidation (Phase 5.5)', () => {
  const validator = new PlanValidator();

  const plan: ActionPlan = {
    planId: 'plan_versioned',
    decisionId: 'dec_1',
    taskId: 't1',
    objective: 'Test versioning',
    status: 'DRAFT',
    steps: [{
      stepId: 's1',
      order: 1,
      type: 'MODIFY',
      description: 'Update module',
      reason: 'Change',
      target: { type: 'MODULE', id: 'CoreModule' },
      dependencies: [],
      preconditions: [],
      expectedOutcome: 'Updated',
      riskLevel: 'LOW',
      validation: [],
      reversibility: 'REVERSIBLE'
    }],
    dependencies: [],
    preconditions: [],
    postconditions: [],
    risks: [],
    validationPlan: { validationId: 'v1', steps: [], requiredTests: [], typeCheck: true, architectureCheck: false, dependencyCheck: true },
    affectedResources: ['CoreModule'],
    estimatedComplexity: 'LOW',
    confidence: 0.9,
    knowledgeVersion: 'graph_v1.0.0',
    contextVersion: '1.0',
    reasoningId: 'rsn_1',
    createdAt: Date.now()
  };

  it('should mark plan STALE when knowledgeVersion differs from plan creation version', () => {
    // Current knowledge state evolved to graph_v2.0.0
    const report = validator.validate(plan, { knowledgeVersion: 'graph_v2.0.0' });

    expect(report.valid).toBe(false);
    expect(report.status).toBe('STALE');
    expect(report.issues[0]).toContain('graph_v1.0.0');
    expect(report.issues[0]).toContain('graph_v2.0.0');
  });
});
