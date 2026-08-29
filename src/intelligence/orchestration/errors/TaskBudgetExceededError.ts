import { OrchestrationError } from './OrchestrationError';

export class TaskBudgetExceededError extends OrchestrationError {
  constructor(message: string, public budgetMetric?: string, public currentVal?: number, public maxVal?: number) {
    super(`TaskBudgetExceededError: ${message} (${budgetMetric}: ${currentVal} > ${maxVal})`, { budgetMetric, currentVal, maxVal });
    this.name = 'TaskBudgetExceededError';
  }
}
