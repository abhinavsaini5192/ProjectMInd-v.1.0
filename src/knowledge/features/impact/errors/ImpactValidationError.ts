import { FeatureImpactError } from './FeatureImpactError.js';

export class ImpactValidationError extends FeatureImpactError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'IMPACT_VALIDATION_ERROR', details);
    this.name = 'ImpactValidationError';
  }
}
