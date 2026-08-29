import { TaskDecision } from '../models/TaskDecision';

export class AskUserStrategy {
  public decide(question: string): TaskDecision {
    return {
      type: 'ASK_USER',
      reason: `Ambiguity or critical decision requires user input: ${question}`,
      confidence: 1.0,
      recommendedAction: 'Pause and present TaskQuestion to user'
    };
  }
}
