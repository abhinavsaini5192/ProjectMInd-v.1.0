export class FeatureImpactError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(message: string, code: string = 'FEATURE_IMPACT_ERROR', details?: Record<string, unknown> | undefined) {
    super(message);
    this.name = 'FeatureImpactError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
