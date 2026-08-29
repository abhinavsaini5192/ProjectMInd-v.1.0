import { OrchestrationError } from './OrchestrationError';

export class TaskStalledError extends OrchestrationError {
  constructor(message: string, public reason?: string) {
    super(`TaskStalledError: ${message} -> ${reason}`, { reason });
    this.name = 'TaskStalledError';
  }
}
