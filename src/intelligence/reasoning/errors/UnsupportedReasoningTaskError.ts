import { ReasoningError } from './ReasoningError';

export class UnsupportedReasoningTaskError extends ReasoningError {
  constructor(taskType: string) {
    super(`UnsupportedReasoningTaskError: Reasoning task type "${taskType}" is not supported by available strategies.`);
    this.name = 'UnsupportedReasoningTaskError';
  }
}
