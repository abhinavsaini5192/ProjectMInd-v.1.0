export class DecompositionError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`DecompositionError: ${message}`);
    this.name = 'DecompositionError';
  }
}
