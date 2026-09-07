export class FeatureBehaviorError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: string = 'FEATURE_BEHAVIOR_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'FeatureBehaviorError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
