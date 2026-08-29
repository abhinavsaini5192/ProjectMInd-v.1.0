import { FeedbackEngine } from '../../feedback/core/FeedbackEngine';
import { ActionPlan } from '../../planning/models/ActionPlan';
import { ExecutionResult } from '../../../agent/execution/models/ExecutionResult';
import { FeedbackResult } from '../../feedback/models/FeedbackResult';

export class FeedbackAdapter {
  constructor(private feedbackEngine: FeedbackEngine) {}

  public async analyzeExecution(
    execution: ExecutionResult,
    plan: ActionPlan,
    dryRun: boolean = false
  ): Promise<FeedbackResult> {
    const { result } = await this.feedbackEngine.processFeedback(execution, plan, dryRun);
    return result;
  }
}
