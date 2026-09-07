export class FeatureDependencyError extends Error {
  constructor(message: string, public readonly code: string = 'FEATURE_DEPENDENCY_ERROR') {
    super(message);
    this.name = 'FeatureDependencyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
