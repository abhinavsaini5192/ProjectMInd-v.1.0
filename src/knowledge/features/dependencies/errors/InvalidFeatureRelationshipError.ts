import { FeatureDependencyError } from './FeatureDependencyError';

export class InvalidFeatureRelationshipError extends FeatureDependencyError {
  constructor(message: string, public readonly validationIssues: string[] = []) {
    super(
      validationIssues.length > 0
        ? `Invalid feature relationship: ${message} (${validationIssues.join(', ')})`
        : `Invalid feature relationship: ${message}`,
      'INVALID_FEATURE_RELATIONSHIP'
    );
    this.name = 'InvalidFeatureRelationshipError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
