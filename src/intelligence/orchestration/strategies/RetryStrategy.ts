import { TaskDecision } from '../models/TaskDecision';

export class RetryStrategy {
  public decide(reason: string): TaskDecision {
    return {
      type: 'RETRY',
      reason: `Transient error observed, safe retry: ${reason}`,
      confidence: 0.8,
      recommendedAction: 'Retry execution step'
    };
  }
}
