import { KernelTask } from '../models/KernelState';
import { KernelJobQueue } from './KernelJobQueue';
import { KernelEventType } from '../types/KernelEvents';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { ILogger } from '../../workspace/interfaces/ILogger';

export class KernelTaskManager {
  private isProcessing = false;

  constructor(
    private queue: KernelJobQueue, 
    private dispatcher: KernelEventDispatcher,
    private logger: ILogger
  ) {}

  public submit(task: KernelTask): void {
    this.queue.enqueue(task);
    this.dispatcher.publish(KernelEventType.TaskEnqueued, { taskId: task.id });
    
    // Fire and forget processor trigger
    this.processNext().catch(e => {
       this.logger.error({ component: 'KernelTaskManager', operation: 'processNext', message: 'Queue processing error', severity: 'ERROR' });
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        const task = this.queue.dequeue();
        if (!task) break; // Queue empty or no ready tasks

        task.status = 'Running';
        this.dispatcher.publish(KernelEventType.TaskStarted, { taskId: task.id });

        try {
          await task.execute();
          task.status = 'Completed';
          this.dispatcher.publish(KernelEventType.TaskCompleted, { taskId: task.id });
        } catch (error: any) {
          task.status = 'Failed';
          this.dispatcher.publish(KernelEventType.TaskFailed, { taskId: task.id, error: error.message });
          
          if (task.retryPolicy && task.retryPolicy.currentRetries < task.retryPolicy.maxRetries) {
            task.retryPolicy.currentRetries++;
            // Basic retry logic (re-enqueue immediately for MVP, or use delayed queue)
            task.status = 'Pending';
            this.queue.enqueue(task);
          } else {
            this.queue.markDeadLetter(task);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
