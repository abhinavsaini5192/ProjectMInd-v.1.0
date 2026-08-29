import { ReasoningTaskType, ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';

export interface ReasoningStrategy {
  readonly name: string;
  readonly version: string;
  supports(taskType: ReasoningTaskType): boolean;
  buildStrategyPrompt(task: ReasoningTask): string;
  postProcess(result: ReasoningResult): ReasoningResult;
}
