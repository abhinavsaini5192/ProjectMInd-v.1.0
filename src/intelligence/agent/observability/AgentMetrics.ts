export interface AgentMetricsSnapshot {
  tasksStarted: number;
  tasksCompleted: number;
  tasksFailed: number;
  tasksStalled: number;
  tasksCancelled: number;
  totalCyclesExecuted: number;
  totalTokensUsed: number;
  modelValidationErrors: number;
  planFreshnessErrors: number;
  securityViolations: number;
  totalExecutionTimeMs: number;
  averageCyclesPerTask: number;
  averageDurationMs: number;
}

export class AgentMetrics {
  private tasksStarted = 0;
  private tasksCompleted = 0;
  private tasksFailed = 0;
  private tasksStalled = 0;
  private tasksCancelled = 0;
  private totalCyclesExecuted = 0;
  private totalTokensUsed = 0;
  private modelValidationErrors = 0;
  private planFreshnessErrors = 0;
  private securityViolations = 0;
  private totalExecutionTimeMs = 0;

  public recordTaskStart(): void {
    this.tasksStarted++;
  }

  public recordTaskEnd(outcome: string, durationMs: number, cycles: number): void {
    this.totalExecutionTimeMs += durationMs;
    this.totalCyclesExecuted += cycles;

    switch (outcome) {
      case 'SUCCESS':
        this.tasksCompleted++;
        break;
      case 'FAILED':
        this.tasksFailed++;
        break;
      case 'STALLED':
        this.tasksStalled++;
        break;
      case 'CANCELLED':
        this.tasksCancelled++;
        break;
      default:
        break;
    }
  }

  public recordTokenUsage(tokens: number): void {
    this.totalTokensUsed += Math.max(0, tokens);
  }

  public recordValidationError(): void {
    this.modelValidationErrors++;
  }

  public recordFreshnessError(): void {
    this.planFreshnessErrors++;
  }

  public recordSecurityViolation(): void {
    this.securityViolations++;
  }

  public getSnapshot(): AgentMetricsSnapshot {
    const finishedTasks = this.tasksCompleted + this.tasksFailed + this.tasksStalled + this.tasksCancelled;
    const averageCyclesPerTask = finishedTasks > 0 ? this.totalCyclesExecuted / finishedTasks : 0;
    const averageDurationMs = finishedTasks > 0 ? this.totalExecutionTimeMs / finishedTasks : 0;

    return {
      tasksStarted: this.tasksStarted,
      tasksCompleted: this.tasksCompleted,
      tasksFailed: this.tasksFailed,
      tasksStalled: this.tasksStalled,
      tasksCancelled: this.tasksCancelled,
      totalCyclesExecuted: this.totalCyclesExecuted,
      totalTokensUsed: this.totalTokensUsed,
      modelValidationErrors: this.modelValidationErrors,
      planFreshnessErrors: this.planFreshnessErrors,
      securityViolations: this.securityViolations,
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      averageCyclesPerTask,
      averageDurationMs,
    };
  }

  public reset(): void {
    this.tasksStarted = 0;
    this.tasksCompleted = 0;
    this.tasksFailed = 0;
    this.tasksStalled = 0;
    this.tasksCancelled = 0;
    this.totalCyclesExecuted = 0;
    this.totalTokensUsed = 0;
    this.modelValidationErrors = 0;
    this.planFreshnessErrors = 0;
    this.securityViolations = 0;
    this.totalExecutionTimeMs = 0;
  }
}
