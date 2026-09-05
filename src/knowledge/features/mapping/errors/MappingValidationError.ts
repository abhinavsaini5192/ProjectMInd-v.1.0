import { FeatureMappingError } from './FeatureMappingError';

export class MappingValidationError extends FeatureMappingError {
  constructor(public readonly mappingId: string, public readonly issues: string[]) {
    super(`Mapping "${mappingId}" failed validation: ${issues.join('; ')}`, { mappingId, issues });
    this.name = 'MappingValidationError';
  }
}
