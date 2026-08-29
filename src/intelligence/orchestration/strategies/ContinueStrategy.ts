import { TaskDecision } from '../models/TaskDecision';

export class ContinueStrategy {
  public decide(): TaskDecision {
    return {
      type: 'CONTINUE',
      reason: 'Previous step completed cleanly, advancing to next planned action',
      confidence: 0.95
    };
  }
}
