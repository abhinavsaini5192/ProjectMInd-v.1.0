import { FeatureError } from './FeatureError';

export class FeatureNotFoundError extends FeatureError {
  constructor(public featureId: string) {
    super(`Feature with ID "${featureId}" was not found`, { featureId });
    this.name = 'FeatureNotFoundError';
  }
}
