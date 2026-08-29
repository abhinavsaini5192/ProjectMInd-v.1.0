import { IActionGenerator } from './IActionGenerator';
import { PlanStep } from '../../planning/models/PlanStep';
import { AgentAction } from '../models/AgentAction';
import { ActionType } from '../models/ActionType';

export class VerificationActionGenerator implements IActionGenerator {
  public generate(step: PlanStep, taskId: string, planId: string): AgentAction[] {
    const actions: AgentAction[] = [];
    
    // Create parallel verification actions
    const verifications = [ActionType.RUN_TYPECHECK, ActionType.RUN_LINT, ActionType.RUN_TEST];
    
    verifications.forEach((vType, index) => {
      actions.push({
        actionId: `act_ver_${step.stepId}_${index}`,
        taskId,
        planId,
        stepId: step.stepId,
        type: vType,
        target: step.affectedEntities.join(','),
        parameters: {},
        dependencies: [], // Linked later
        preconditions: ['Modifications are saved'],
        expectedOutcome: `${vType} passes successfully`,
        provenance: 'Deterministic Generator',
        risk: 'LOW',
        confidence: step.confidence,
        createdAt: Date.now()
      });
    });

    return actions;
  }
}
