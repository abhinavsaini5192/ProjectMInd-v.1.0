import { FeatureMappingError } from './FeatureMappingError';

export class InvalidResourceReferenceError extends FeatureMappingError {
  constructor(public readonly resourceId: string, reason: string) {
    super(`Invalid resource reference "${resourceId}": ${reason}`, { resourceId, reason });
    this.name = 'InvalidResourceReferenceError';
  }
}
