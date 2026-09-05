export class ModelOutputValidationError extends Error {
  constructor(
    message: string,
    public readonly rawOutput?: string,
    public readonly validationErrors?: string[],
    public readonly details?: Record<string, any>
  ) {
    super(`ModelOutputValidationError: ${message}`);
    this.name = 'ModelOutputValidationError';
  }
}
