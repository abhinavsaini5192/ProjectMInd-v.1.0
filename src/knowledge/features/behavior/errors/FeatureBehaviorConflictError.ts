import { FeatureBehaviorError } from './FeatureBehaviorError';

export class FeatureBehaviorConflictError extends FeatureBehaviorError {
  public readonly conflictId?: string;
  public readonly featureId?: string;

  constructor(message: string, conflictId?: string, featureId?: string, details?: Record<string, any>) {
    super(message, 'FEATURE_BEHAVIOR_CONFLICT_ERROR', { ...details, conflictId, featureId });
    this.name = 'FeatureBehaviorConflictError';
    this.conflictId = conflictId;
    this.featureId = featureId;
  }
}
