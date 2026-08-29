import { OrchestrationError } from './OrchestrationError';

export class TaskLoopError extends OrchestrationError {
  constructor(message: string, public cycleNumber?: number) {
    super(`TaskLoopError: ${message}`, { cycleNumber });
    this.name = 'TaskLoopError';
  }
}
