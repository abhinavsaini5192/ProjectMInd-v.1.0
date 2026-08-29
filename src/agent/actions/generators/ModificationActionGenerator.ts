import { IActionGenerator } from './IActionGenerator';
import { PlanStep } from '../../planning/models/PlanStep';
import { AgentAction } from '../models/AgentAction';
import { ActionType } from '../models/ActionType';

export class ModificationActionGenerator implements IActionGenerator {
  public generate(step: PlanStep, taskId: string, planId: string): AgentAction[] {
    const actions: AgentAction[] = [];
    
    step.affectedEntities.forEach((entity, index) => {
      actions.push({
        actionId: `act_mod_${step.stepId}_${index}`,
        taskId,
        planId,
        stepId: step.stepId,
        type: ActionType.EDIT_FILE,
        target: entity,
        parameters: { intent: step.description },
        dependencies: [], // Will be linked by ActionPlanner to previous steps
        preconditions: [`File ${entity} is accessible`],
        expectedOutcome: `Modified ${entity} to satisfy plan step`,
        provenance: 'Deterministic Generator',
        risk: step.risk,
        confidence: step.confidence,
        createdAt: Date.now()
      });
    });

    return actions;
  }
}
