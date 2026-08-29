import { ReasoningError } from './ReasoningError';

export class ReasoningValidationError extends ReasoningError {
  constructor(message: string, public issues: string[]) {
    super(`ReasoningValidationError: ${message} -> [${issues.join('; ')}]`, { issues });
    this.name = 'ReasoningValidationError';
  }
}
