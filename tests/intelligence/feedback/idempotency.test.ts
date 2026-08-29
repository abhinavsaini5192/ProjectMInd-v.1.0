import { describe, it, expect } from 'vitest';
import { FeedbackEngine } from '../../../src/intelligence/feedback/core/FeedbackEngine';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Feedback: Idempotency & Crash Recovery', () => {
  const plan: ActionPlan = {
    planId: 'plan_idem_1',
    taskId: 'task_idem_1',
    objective: 'Test idempotency',
    version: 1,
    steps: [],
    dependencies: [],
    preconditions: [],
    postconditions: [],
    risks: [],
    validationPlan: { validationId: 'v1', requiredChecks: [] },
    estimatedTokens: 100,
    affectedResources: [],
    status: 'READY',
    createdAt: Date.now()
  };

  it('should ignore duplicate execution results without duplicate memory or graph updates', async () => {
    const feedbackEngine = new FeedbackEngine();

    const execution = {
      executionId: 'exec_idempotent_1',
      status: 'SUCCEEDED' as any,
      changes: [{ path: 'src/app.ts', type: 'MODIFIED' }],
      succeeded: 1,
      failed: 0,
      errors: []
    };

    // First call
    const firstPass = await feedbackEngine.processFeedback(execution, plan);
    expect(firstPass.result.memoryUpdates.length).toBeGreaterThan(0);
    expect(firstPass.result.knowledgeUpdates.length).toBeGreaterThan(0);

    // Duplicate call with same executionId
    const secondPass = await feedbackEngine.processFeedback(execution, plan);
    expect(secondPass.result.memoryUpdates.length).toBe(0);
    expect(secondPass.result.knowledgeUpdates.length).toBe(0);
    expect(secondPass.result.warnings).toContain('Duplicate ExecutionCompleted event ignored for idempotency');
  });

  it('should support dryRun mode without mutating memory or knowledge state', async () => {
    const feedbackEngine = new FeedbackEngine();

    const execution = {
      executionId: 'exec_dryrun_1',
      status: 'SUCCEEDED' as any,
      changes: [{ path: 'src/dry.ts', type: 'MODIFIED' }],
      succeeded: 1,
      failed: 0,
      errors: []
    };

    const dryRunResult = await feedbackEngine.processFeedback(execution, plan, true);
    expect(dryRunResult.result.memoryUpdates.length).toBe(0);
    expect(dryRunResult.result.knowledgeUpdates.length).toBe(0);
    expect(dryRunResult.result.contextInvalidations.length).toBe(0);
    expect(dryRunResult.result.learningCandidates.length).toBeGreaterThan(0);
  });
});
