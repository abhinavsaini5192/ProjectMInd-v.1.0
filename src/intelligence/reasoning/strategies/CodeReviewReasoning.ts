import { ReasoningStrategy } from './ReasoningStrategy';
import { ReasoningTaskType, ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';

export class CodeReviewReasoning implements ReasoningStrategy {
  public readonly name = 'CodeReviewStrategy';
  public readonly version = '1.0';

  public supports(taskType: ReasoningTaskType): boolean {
    return taskType === ReasoningTaskType.CODE_REVIEW;
  }

  public buildStrategyPrompt(task: ReasoningTask): string {
    return [
      '## REASONING STRATEGY: CODE REVIEW',
      '1. Analyze recent change sets and affected symbol contracts.',
      '2. Verify architectural boundaries, coupling invariants, and security constraints.',
      '3. Formulate findings with severity and supporting context evidence.'
    ].join('\n');
  }

  public postProcess(result: ReasoningResult): ReasoningResult {
    result.strategyVersion = this.version;
    return result;
  }
}
