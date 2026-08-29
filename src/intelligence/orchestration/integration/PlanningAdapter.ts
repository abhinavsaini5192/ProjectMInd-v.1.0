import { PlanningCoordinator } from '../../planning/core/PlanningCoordinator';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../../planning/models/ActionPlan';

export class PlanningAdapter {
  constructor(private coordinator: PlanningCoordinator) {}

  public async createPlan(reasoning: ReasoningResult): Promise<ActionPlan> {
    const outcome = await this.coordinator.processReasoning(reasoning);
    return outcome.plan;
  }
}
