import { describe, it, expect } from 'vitest';
import { FeedbackEngine } from '../../../src/intelligence/feedback/core/FeedbackEngine';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Feedback: End-to-End Integration', () => {
  it('should orchestrate full outcome analysis, learning promotion, and Brain feedback payload', async () => {
    const feedbackEngine = new FeedbackEngine();

    const plan: ActionPlan = {
      planId: 'plan_integ_1',
      taskId: 'task_auth_fix',
      objective: 'Fix authentication token timeout bug',
      version: 1,
      steps: [{ stepId: 'step_1', description: 'Extend token validity', target: { id: 'src/auth/AuthService.ts', type: 'FILE' }, action: 'MODIFY', dependencies: [], risks: [] }],
      dependencies: [],
      preconditions: [],
      postconditions: [],
      risks: [],
      validationPlan: { validationId: 'v_integ', requiredChecks: ['Run tests'] },
      estimatedTokens: 200,
      affectedResources: ['src/auth/AuthService.ts'],
      status: 'READY',
      createdAt: Date.now()
    };

    const execution = {
      executionId: 'exec_auth_success',
      status: 'SUCCEEDED' as any,
      changes: [{ path: 'src/auth/AuthService.ts', type: 'MODIFIED' }],
      succeeded: 1,
      failed: 0,
      errors: [],
      warnings: []
    };

    const { result, brainFeedback } = await feedbackEngine.processFeedback(execution, plan);

    expect(result.outcome.objectiveSuccess).toBe(true);
    expect(result.changes.symbolsChanged).toContain('sym_AuthService');
    expect(result.promotedLearning.length).toBeGreaterThan(0);
    expect(result.contextInvalidations).toContain('src/auth/AuthService.ts');
    expect(result.contextInvalidations).toContain('symbols_context');
    expect(brainFeedback.objectiveAchieved).toBe(true);
    expect(brainFeedback.suggestedAction).toBe('COMPLETE');
  });
});
