import { TaskCycle } from '../models/TaskCycle';

export class CycleManager {
  private cycleCount = 0;

  public createCycle(taskId: string): TaskCycle {
    this.cycleCount++;
    return {
      cycleId: `cycle_${taskId}_${this.cycleCount}_${Date.now()}`,
      taskId,
      cycleNumber: this.cycleCount,
      startedAt: Date.now()
    };
  }

  public completeCycle(cycle: TaskCycle, outcome: string): TaskCycle {
    return {
      ...cycle,
      outcome,
      completedAt: Date.now()
    };
  }
}
