import { Task } from '../models/Task';
import { TaskBudgetExceededError } from '../errors/TaskBudgetExceededError';

export class BudgetGuard {
  public checkBudget(task: Task, currentDurationMs: number): void {
    if (task.currentCycle > task.budget.maxCycles) {
      throw new TaskBudgetExceededError('Max task cycles exceeded', 'cycles', task.currentCycle, task.budget.maxCycles);
    }
    if (currentDurationMs > task.budget.maxExecutionTimeMs) {
      throw new TaskBudgetExceededError('Max execution time exceeded', 'durationMs', currentDurationMs, task.budget.maxExecutionTimeMs);
    }
  }
}
