import { FeatureBehaviorError } from './FeatureBehaviorError';

export class InvalidBehaviorReferenceError extends FeatureBehaviorError {
  public readonly referenceType: string;
  public readonly referenceId: string;

  constructor(referenceType: string, referenceId: string, details?: Record<string, any>) {
    super(
      `Invalid behavior reference to ${referenceType} with ID: "${referenceId}"`,
      'INVALID_BEHAVIOR_REFERENCE_ERROR',
      { ...details, referenceType, referenceId }
    );
    this.name = 'InvalidBehaviorReferenceError';
    this.referenceType = referenceType;
    this.referenceId = referenceId;
  }
}
