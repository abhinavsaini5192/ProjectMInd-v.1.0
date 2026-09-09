import { FeatureHealthError } from './FeatureHealthError.js';

export class HealthValidationError extends FeatureHealthError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[] = [], details?: Record<string, unknown>) {
    super(message, 'HEALTH_VALIDATION_ERROR', { ...details, validationErrors });
    this.name = 'HealthValidationError';
    this.validationErrors = validationErrors;
  }
}
