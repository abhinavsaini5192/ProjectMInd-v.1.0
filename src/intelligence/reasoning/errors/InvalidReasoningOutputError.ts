import { ReasoningError } from './ReasoningError';

export class InvalidReasoningOutputError extends ReasoningError {
  constructor(message: string, public rawOutput?: string) {
    super(`InvalidReasoningOutputError: ${message}`, { rawOutput });
    this.name = 'InvalidReasoningOutputError';
  }
}
