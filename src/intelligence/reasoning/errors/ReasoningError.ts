export class ReasoningError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`ReasoningError: ${message}`);
    this.name = 'ReasoningError';
  }
}
