import { FeatureImpactError } from './FeatureImpactError.js';

export class ImpactPropagationError extends FeatureImpactError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'IMPACT_PROPAGATION_ERROR', details);
    this.name = 'ImpactPropagationError';
  }
}
