import { FeatureMappingError } from './FeatureMappingError';

export class MappingConflictError extends FeatureMappingError {
  constructor(
    public readonly conflictId: string,
    public readonly featureId: string,
    public readonly resourceId: string,
    reason: string
  ) {
    super(`Mapping conflict "${conflictId}" for resource "${resourceId}" on feature "${featureId}": ${reason}`, {
      conflictId,
      featureId,
      resourceId,
      reason,
    });
    this.name = 'MappingConflictError';
  }
}
