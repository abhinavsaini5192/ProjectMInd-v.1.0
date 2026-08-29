import { IActionGenerator } from './IActionGenerator';
import { PlanStep } from '../../planning/models/PlanStep';
import { AgentAction } from '../models/AgentAction';
import { ActionType } from '../models/ActionType';

export class InvestigationActionGenerator implements IActionGenerator {
  public generate(step: PlanStep, taskId: string, planId: string): AgentAction[] {
    const actions: AgentAction[] = [];
    
    // For every affected entity in the INVESTIGATION step, generate a READ_FILE action
    step.affectedEntities.forEach((entity, index) => {
      actions.push({
        actionId: `act_inv_${step.stepId}_${index}`,
        taskId,
        planId,
        stepId: step.stepId,
        type: ActionType.READ_FILE,
        target: entity,
        parameters: {},
        dependencies: [], // These run first or in parallel
        preconditions: [`File ${entity} exists`],
        expectedOutcome: `Read contents of ${entity}`,
        provenance: 'Deterministic Generator',
        risk: 'LOW',
        confidence: step.confidence,
        createdAt: Date.now()
      });
    });

    return actions;
  }
}
