export class FeatureHealthError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string = 'FEATURE_HEALTH_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'FeatureHealthError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
