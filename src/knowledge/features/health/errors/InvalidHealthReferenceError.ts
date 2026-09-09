import { FeatureHealthError } from './FeatureHealthError.js';

export class InvalidHealthReferenceError extends FeatureHealthError {
  public readonly referenceType: string;
  public readonly referenceId: string;

  constructor(referenceType: string, referenceId: string, details?: Record<string, unknown>) {
    super(
      `Invalid health reference to ${referenceType} with ID: "${referenceId}"`,
      'INVALID_HEALTH_REFERENCE_ERROR',
      { ...details, referenceType, referenceId }
    );
    this.name = 'InvalidHealthReferenceError';
    this.referenceType = referenceType;
    this.referenceId = referenceId;
  }
}
