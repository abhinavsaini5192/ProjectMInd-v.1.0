export class OrchestrationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`OrchestrationError: ${message}`);
    this.name = 'OrchestrationError';
  }
}
