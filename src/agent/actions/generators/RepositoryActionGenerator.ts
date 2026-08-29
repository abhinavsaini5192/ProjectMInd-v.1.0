import { IActionGenerator } from './IActionGenerator';
import { PlanStep } from '../../planning/models/PlanStep';
import { AgentAction } from '../models/AgentAction';
import { ActionType } from '../models/ActionType';

export class RepositoryActionGenerator implements IActionGenerator {
  public generate(step: PlanStep, taskId: string, planId: string): AgentAction[] {
    return [
      {
        actionId: `act_repo_${step.stepId}`,
        taskId,
        planId,
        stepId: step.stepId,
        type: ActionType.GIT_STATUS,
        target: 'repository',
        parameters: {},
        dependencies: [],
        preconditions: [],
        expectedOutcome: 'Retrieved clean repository state',
        provenance: 'Deterministic Generator',
        risk: 'LOW',
        confidence: 1.0,
        createdAt: Date.now()
      }
    ];
  }
}
