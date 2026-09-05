import type { MappingCandidate } from '../models/MappingCandidate';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingConflict } from '../models/MappingConflict';

export interface ResolutionResult {
  resolvedMappings: FeatureResourceMapping[];
  conflicts: MappingConflict[];
}

export interface IFeatureMappingResolver {
  resolve(
    candidates: MappingCandidate[],
    existingMappings: FeatureResourceMapping[]
  ): ResolutionResult;
}
