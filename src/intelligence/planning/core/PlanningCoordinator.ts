import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { DecisionEngine } from './DecisionEngine';
import { ActionPlanner } from './ActionPlanner';
import { PlanValidator, PlanValidationReport } from '../validation/PlanValidator';
import { Decision } from '../models/Decision';
import { ActionPlan } from '../models/ActionPlan';

export interface PlanningOutcome {
  decision: Decision;
  plan: ActionPlan;
  validationReport: PlanValidationReport;
}

export class PlanningCoordinator {
  private decisionEngine = new DecisionEngine();
  private actionPlanner = new ActionPlanner();
  private planValidator = new PlanValidator();

  public processReasoning(
    reasoning: ReasoningResult,
    knowledgeState?: { knowledgeVersion?: string; symbols?: string[]; files?: string[] }
  ): PlanningOutcome {
    // 1. Evaluate reasoning and make decision
    const decision = this.decisionEngine.evaluate(reasoning);

    // 2. Build action plan based on decision
    const plan = this.actionPlanner.plan(
      decision,
      reasoning,
      knowledgeState?.knowledgeVersion || '1.0'
    );

    // 3. Validate plan and update status (VALIDATED, NEEDS_APPROVAL, STALE, or INVALIDATED)
    const validationReport = this.planValidator.validate(plan, knowledgeState);
    plan.status = validationReport.status;

    return {
      decision,
      plan,
      validationReport
    };
  }
}
