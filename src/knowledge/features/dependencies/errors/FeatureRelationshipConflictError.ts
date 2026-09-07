import { FeatureDependencyError } from './FeatureDependencyError';

export class FeatureRelationshipConflictError extends FeatureDependencyError {
  constructor(
    public readonly sourceFeatureId: string,
    public readonly targetFeatureId: string,
    message: string
  ) {
    super(`Conflict between feature "${sourceFeatureId}" and "${targetFeatureId}": ${message}`, 'FEATURE_RELATIONSHIP_CONFLICT');
    this.name = 'FeatureRelationshipConflictError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
