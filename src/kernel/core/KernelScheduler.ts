import { IKernelScheduler } from '../interfaces/IKernel';
import { KernelTaskManager } from './KernelTaskManager';
import { KernelTask, TaskPriority } from '../models/KernelState';
import crypto from 'crypto';

export class KernelScheduler implements IKernelScheduler {
  constructor(private taskManager: KernelTaskManager) {}

  public scheduleImmediate(executable: () => Promise<void>): void {
    this.taskManager.submit(this.createTask(executable, TaskPriority.High));
  }

  public scheduleBackground(executable: () => Promise<void>): void {
    this.taskManager.submit(this.createTask(executable, TaskPriority.Background));
  }

  public scheduleDelayed(executable: () => Promise<void>, delayMs: number): void {
    setTimeout(() => {
      this.taskManager.submit(this.createTask(executable, TaskPriority.Normal));
    }, delayMs);
  }

  private createTask(execute: () => Promise<void>, priority: TaskPriority): KernelTask {
    return {
      id: crypto.randomUUID(),
      name: 'ScheduledTask',
      priority,
      status: 'Pending',
      execute,
      createdAt: Date.now()
    };
  }
}
