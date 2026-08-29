import { describe, it, expect, beforeEach } from 'vitest';
import { ActionPlanner } from '../../../src/agent/actions/core/ActionPlanner';
import { TaskPlan, TaskIntent } from '../../../src/agent/planning/models/TaskPlan';
import { StepType } from '../../../src/agent/planning/models/PlanStep';
import { ActionType } from '../../../src/agent/actions/models/ActionType';

describe('Action Planning Engine (Phase 4.3)', () => {
  let actionPlanner: ActionPlanner;

  beforeEach(() => {
    actionPlanner = new ActionPlanner();
  });

  const mockPlan: TaskPlan = {
    planId: 'plan_1',
    taskId: 'task_1',
    objective: 'Fix auth',
    intent: TaskIntent.BUG_FIX,
    scope: ['AuthService.ts'],
    steps: [
      {
        stepId: 'step_inv',
        description: 'Investigate',
        type: StepType.INVESTIGATION,
        dependencies: [],
        affectedEntities: ['AuthService.ts'],
        expectedOutcome: 'Found root cause',
        risk: 'LOW',
        confidence: 0.9
      },
      {
        stepId: 'step_mod',
        description: 'Fix it',
        type: StepType.MODIFICATION,
        dependencies: ['step_inv'],
        affectedEntities: ['AuthService.ts'],
        expectedOutcome: 'Fixed',
        risk: 'LOW',
        confidence: 0.9
      },
      {
        stepId: 'step_ver',
        description: 'Verify it',
        type: StepType.VERIFICATION,
        dependencies: ['step_mod'],
        affectedEntities: ['AuthService.ts'],
        expectedOutcome: 'Verified',
        risk: 'LOW',
        confidence: 0.9
      }
    ],
    dependencies: [],
    affectedEntities: ['AuthService.ts'],
    risk: 'LOW',
    confidence: 0.9,
    approvalRequirement: false,
    assumptions: [],
    warnings: [],
    createdAt: Date.now()
  };

  it('should translate a TaskPlan into a valid ActionGraph', () => {
    const graph = actionPlanner.generateActionGraph(mockPlan);
    const actions = graph.getAllActions();

    expect(actions.length).toBeGreaterThan(0);
    
    const readActions = actions.filter(a => a.type === ActionType.READ_FILE);
    const editActions = actions.filter(a => a.type === ActionType.EDIT_FILE);
    const verifyActions = actions.filter(a => [ActionType.RUN_TEST, ActionType.RUN_LINT, ActionType.RUN_TYPECHECK].includes(a.type));

    expect(readActions.length).toBe(1);
    expect(editActions.length).toBe(1);
    
    // The verification step should generate multiple parallel actions
    expect(verifyActions.length).toBe(3);

    // Check Dependencies
    // The edit action should depend on the read action
    const editAction = editActions[0];
    expect(editAction.dependencies.length).toBe(1);
    expect(editAction.dependencies[0]).toBe(readActions[0].actionId);
    
    // The verify actions should depend on the edit action
    const verifyAction = verifyActions[0];
    expect(verifyAction.dependencies.length).toBe(1);
    expect(verifyAction.dependencies[0]).toBe(editAction.actionId);
  });

  it('should validate the acyclic nature of the ActionGraph', () => {
    // Manually create a plan that creates a circular dependency
    // (This normally wouldn't happen because DependencyPlanner prevents it, but we test the Graph validation)
    const circularPlan = { ...mockPlan, steps: [
      {
        ...mockPlan.steps[0],
        dependencies: ['step_mod']
      },
      {
        ...mockPlan.steps[1],
        dependencies: ['step_inv']
      }
    ]};

    expect(() => {
       actionPlanner.generateActionGraph(circularPlan);
    }).toThrow(/Circular dependency/);
  });
});
