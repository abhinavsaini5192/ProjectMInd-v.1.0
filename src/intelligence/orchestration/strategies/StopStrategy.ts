import { TaskDecision } from '../models/TaskDecision';

export class StopStrategy {
  public decide(reason: string): TaskDecision {
    return {
      type: 'STOP',
      reason: `Terminal condition reached: ${reason}`,
      confidence: 1.0,
      recommendedAction: 'Halt task loop'
    };
  }
}
