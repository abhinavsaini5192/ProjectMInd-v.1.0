import { TaskDecision } from '../models/TaskDecision';

export class ReplanStrategy {
  public decide(reason: string): TaskDecision {
    return {
      type: 'REPLAN',
      reason: `Replanning requested: ${reason}`,
      confidence: 0.85,
      recommendedAction: 'Generate revised ActionPlan version'
    };
  }
}
