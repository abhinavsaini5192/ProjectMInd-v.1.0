import { ReasoningStrategy } from './ReasoningStrategy';
import { ReasoningTaskType, ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';

export class ArchitectureReasoning implements ReasoningStrategy {
  public readonly name = 'ArchitectureAnalysisStrategy';
  public readonly version = '1.0';

  public supports(taskType: ReasoningTaskType): boolean {
    return taskType === ReasoningTaskType.ARCHITECTURE_ANALYSIS;
  }

  public buildStrategyPrompt(task: ReasoningTask): string {
    return [
      '## REASONING STRATEGY: ARCHITECTURAL ANALYSIS',
      '1. Evaluate modular boundaries, cross-layer dependency flow, and cohesion.',
      '2. Identify architectural violations, cyclic dependencies, or leakages.',
      '3. Formulate architectural recommendations backed by structural evidence.'
    ].join('\n');
  }

  public postProcess(result: ReasoningResult): ReasoningResult {
    result.strategyVersion = this.version;
    return result;
  }
}
