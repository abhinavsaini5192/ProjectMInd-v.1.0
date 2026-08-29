import { ReasoningStrategy } from './ReasoningStrategy';
import { ReasoningTaskType, ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';

export class PlanningReasoning implements ReasoningStrategy {
  public readonly name = 'PlanningStrategy';
  public readonly version = '1.0';

  public supports(taskType: ReasoningTaskType): boolean {
    return (
      taskType === ReasoningTaskType.IMPLEMENTATION_PLANNING ||
      taskType === ReasoningTaskType.CHANGE_PLANNING ||
      taskType === ReasoningTaskType.GENERAL_ANALYSIS
    );
  }

  public buildStrategyPrompt(task: ReasoningTask): string {
    return [
      '## REASONING STRATEGY: IMPLEMENTATION PLANNING',
      '1. Break down the task into discrete, ordered implementation steps.',
      '2. Identify dependencies between steps, expected outcomes, and risk levels.',
      '3. Formulate testing and verification requirements for every proposed step.'
    ].join('\n');
  }

  public postProcess(result: ReasoningResult): ReasoningResult {
    result.strategyVersion = this.version;
    return result;
  }
}
