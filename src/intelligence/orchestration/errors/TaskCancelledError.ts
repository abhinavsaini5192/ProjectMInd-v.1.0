import { OrchestrationError } from './OrchestrationError';

export class TaskCancelledError extends OrchestrationError {
  constructor(message: string, public taskId: string) {
    super(`TaskCancelledError: Task "${taskId}" was cancelled. ${message}`, { taskId });
    this.name = 'TaskCancelledError';
  }
}
