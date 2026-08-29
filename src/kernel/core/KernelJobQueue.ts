import { KernelTask } from '../models/KernelState';

export class KernelJobQueue {
  private queue: KernelTask[] = [];
  private deadLetters: KernelTask[] = [];

  public enqueue(task: KernelTask): void {
    this.queue.push(task);
    // Sort by priority (lower number = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  public dequeue(): KernelTask | undefined {
    // If there are dependencies, we would evaluate them here before dequeuing.
    // For MVP, we assume simple enqueueing.
    const readyIdx = this.queue.findIndex(t => !t.dependencies || t.dependencies.length === 0);
    if (readyIdx !== -1) {
      return this.queue.splice(readyIdx, 1)[0];
    }
    return undefined;
  }

  public markDeadLetter(task: KernelTask): void {
    this.deadLetters.push(task);
  }

  public getPendingCount(): number {
    return this.queue.length;
  }
}
