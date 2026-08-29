import { describe, it, expect } from 'vitest';
import { PlanValidator } from '../../../src/intelligence/planning/validation/PlanValidator';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Plan Validator (Phase 5.5)', () => {
  const validator = new PlanValidator();

  const safePlan: ActionPlan = {
    planId: 'plan_safe',
    decisionId: 'dec_safe',
    taskId: 'task_safe',
    objective: 'Safe bug fix',
    status: 'DRAFT',
    steps: [{
      stepId: 's1',
      order: 1,
      type: 'MODIFY',
      description: 'Update config',
      reason: 'Safe fix',
      target: { type: 'SYMBOL', id: 'AuthService' },
      dependencies: [],
      preconditions: ['Symbol AuthService exists'],
      expectedOutcome: 'Config updated',
      riskLevel: 'LOW',
      validation: ['Tests pass'],
      reversibility: 'REVERSIBLE'
    }],
    dependencies: [],
    preconditions: [{ type: 'SYMBOL_EXISTS', target: 'AuthService' }],
    postconditions: [],
    risks: [{ level: 'LOW', factors: ['Standard change'] }],
    validationPlan: { validationId: 'v1', steps: [], requiredTests: [], typeCheck: true, architectureCheck: false, dependencyCheck: true },
    affectedResources: ['AuthService'],
    estimatedComplexity: 'LOW',
    confidence: 0.95,
    knowledgeVersion: '1.0',
    contextVersion: '1.0',
    reasoningId: 'rsn_safe',
    createdAt: Date.now()
  };

  it('should validate safe plans with VALIDATED status', () => {
    const report = validator.validate(safePlan, { knowledgeVersion: '1.0', symbols: ['AuthService'] });
    expect(report.valid).toBe(true);
    expect(report.status).toBe('VALIDATED');
    expect(report.requiresApproval).toBe(false);
  });

  it('should escalate high-risk destructive actions to NEEDS_APPROVAL status', () => {
    const highRiskPlan: ActionPlan = {
      ...safePlan,
      planId: 'plan_danger',
      steps: [{
        stepId: 's_del',
        order: 1,
        type: 'DELETE',
        description: 'Delete user database table',
        reason: 'Clean legacy data',
        target: { type: 'DATABASE_ENTITY', id: 'users_table' },
        dependencies: [],
        preconditions: [],
        expectedOutcome: 'Deleted table',
        riskLevel: 'CRITICAL',
        validation: [],
        reversibility: 'IRREVERSIBLE'
      }],
      risks: [{ level: 'CRITICAL', factors: ['Destructive deletion of user table'] }]
    };

    const report = validator.validate(highRiskPlan, { knowledgeVersion: '1.0' });
    expect(report.valid).toBe(true);
    expect(report.status).toBe('NEEDS_APPROVAL');
    expect(report.requiresApproval).toBe(true);
    expect(report.approvalReasons.some(r => r.includes('Destructive deletion') || r.includes('CRITICAL'))).toBe(true);
  });

  it('should invalidate plans with unsatisfied preconditions on nonexistent symbols', () => {
    const brokenPreconditionPlan: ActionPlan = {
      ...safePlan,
      preconditions: [{ type: 'SYMBOL_EXISTS', target: 'NonExistentService' }]
    };

    const report = validator.validate(brokenPreconditionPlan, { knowledgeVersion: '1.0', symbols: ['AuthService'] });
    expect(report.valid).toBe(false);
    expect(report.status).toBe('INVALIDATED');
    expect(report.issues.some(i => i.includes('Precondition failed'))).toBe(true);
  });
});
