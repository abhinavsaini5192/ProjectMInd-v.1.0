import { DecompositionError } from './DecompositionError';

export class ContextSelectionError extends DecompositionError {
  constructor(message: string, public details?: Record<string, any>) {
    super(`ContextSelectionError: ${message}`, details);
    this.name = 'ContextSelectionError';
  }
}
