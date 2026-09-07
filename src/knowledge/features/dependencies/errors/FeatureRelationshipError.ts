import { FeatureDependencyError } from './FeatureDependencyError';

export class FeatureRelationshipError extends FeatureDependencyError {
  constructor(message: string, code: string = 'FEATURE_RELATIONSHIP_ERROR') {
    super(message, code);
    this.name = 'FeatureRelationshipError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
