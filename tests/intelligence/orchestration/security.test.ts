import { describe, it, expect } from 'vitest';
import { ApprovalGuard } from '../../../src/intelligence/orchestration/guards/ApprovalGuard';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';
import { DEFAULT_ORCHESTRATION_POLICY } from '../../../src/intelligence/orchestration/policies/DefaultOrchestrationPolicy';

describe('Orchestration: Security & Approval Guards', () => {
  it('should require approval for plans containing destructive DELETE actions', () => {
    const guard = new ApprovalGuard();

    const plan: ActionPlan = {
      planId: 'plan_del_1',
      taskId: 'task_del_1',
      objective: 'Delete deprecated database migration',
      version: 1,
      steps: [{
        stepId: 'step_delete',
        description: 'Delete migration file',
        target: { id: 'src/db/old.ts', type: 'FILE' },
        action: 'DELETE',
        dependencies: [],
        risks: [{ riskId: 'r1', type: 'DATA_LOSS', severity: 'HIGH', description: 'Irreversible deletion', mitigation: 'Backup' }]
      }],
      dependencies: [],
      preconditions: [],
      postconditions: [],
      risks: [],
      validationPlan: { validationId: 'v1', requiredChecks: [] },
      estimatedTokens: 100,
      affectedResources: ['src/db/old.ts'],
      status: 'NEEDS_APPROVAL',
      createdAt: Date.now()
    };

    const needsApproval = guard.requiresApproval(plan, DEFAULT_ORCHESTRATION_POLICY);
    expect(needsApproval).toBe(true);
  });
});
