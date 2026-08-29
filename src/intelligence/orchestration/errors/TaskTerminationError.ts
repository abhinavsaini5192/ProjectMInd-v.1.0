import { OrchestrationError } from './OrchestrationError';

export class TaskTerminationError extends OrchestrationError {
  constructor(message: string, public terminationReason: string) {
    super(`TaskTerminationError: ${message} (Reason: ${terminationReason})`, { terminationReason });
    this.name = 'TaskTerminationError';
  }
}
