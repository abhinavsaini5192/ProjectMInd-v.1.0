import { FeatureImpactError } from './FeatureImpactError.js';

export class InvalidImpactReferenceError extends FeatureImpactError {
  constructor(referenceType: string, referenceId: string, details?: Record<string, unknown>) {
    super(
      `Invalid impact reference for ${referenceType}: "${referenceId}" not found or malformed`,
      'INVALID_IMPACT_REFERENCE',
      { referenceType, referenceId, ...details }
    );
    this.name = 'InvalidImpactReferenceError';
  }
}
