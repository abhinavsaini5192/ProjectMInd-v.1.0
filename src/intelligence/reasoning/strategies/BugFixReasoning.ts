import { ReasoningStrategy } from './ReasoningStrategy';
import { ReasoningTaskType, ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';

export class BugFixReasoning implements ReasoningStrategy {
  public readonly name = 'BugAnalysisStrategy';
  public readonly version = '1.0';

  public supports(taskType: ReasoningTaskType): boolean {
    return taskType === ReasoningTaskType.BUG_ANALYSIS;
  }

  public buildStrategyPrompt(task: ReasoningTask): string {
    return [
      '## REASONING STRATEGY: BUG ANALYSIS',
      '1. Identify observed error symptoms from the context.',
      '2. Trace affected dependency chains and recent code modifications.',
      '3. Formulate competing root-cause hypotheses with confidence ratings.',
      '4. Select the most supported conclusion grounded in verified code facts.',
      '5. Specify targets, required verifications, and regression risks.'
    ].join('\n');
  }

  public postProcess(result: ReasoningResult): ReasoningResult {
    result.strategyVersion = this.version;
    return result;
  }
}
