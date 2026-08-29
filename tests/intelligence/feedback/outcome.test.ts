import { describe, it, expect } from 'vitest';
import { OutcomeAnalyzer } from '../../../src/intelligence/feedback/core/OutcomeAnalyzer';
import { ExecutionObserver } from '../../../src/intelligence/feedback/core/ExecutionObserver';
import { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';

describe('Feedback: Outcome Analysis & Goal Evaluation', () => {
  it('should distinguish execution success from true objective goal achievement', () => {
    const observer = new ExecutionObserver();
    const outcomeAnalyzer = new OutcomeAnalyzer();

    const plan: ActionPlan = {
      planId: 'plan_goal_1',
      taskId: 'task_goal_1',
      objective: 'Fix timeout defect',
      version: 1,
      steps: [{ stepId: 's1', description: 'Edit timeout', target: { id: 'src/auth.ts', type: 'FILE' }, action: 'MODIFY', dependencies: [], risks: [] }],
      dependencies: [],
      preconditions: [],
      postconditions: [],
      risks: [],
      validationPlan: { validationId: 'v1', requiredChecks: [] },
      estimatedTokens: 100,
      affectedResources: ['src/auth.ts'],
      status: 'READY',
      createdAt: Date.now()
    };

    // Case 1: Execution command succeeded, but verification tests failed
    const observationPartial = observer.observe({
      executionId: 'exec_partial',
      status: 'SUCCEEDED' as any,
      changes: [{ path: 'src/auth.ts', type: 'MODIFIED' }],
      succeeded: 1,
      failed: 1,
      errors: ['Test timeout still failed']
    }, plan);

    const outcome = outcomeAnalyzer.analyzeOutcome(plan, observationPartial);
    expect(outcome.executionSuccess).toBe(true);
    expect(outcome.objectiveSuccess).toBe(false);
    expect(outcome.goalEvaluation.goalStatus).toBe('PARTIALLY_ACHIEVED');
    expect(outcome.failureAnalysis?.failureType).toBe('TEST_FAILURE');
  });
});
