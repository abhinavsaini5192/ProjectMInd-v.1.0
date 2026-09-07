import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyConflict } from '../models/FeatureDependencyConflict';

export interface ResolutionResult {
  resolvedRelationships: FeatureRelationship[];
  conflicts: FeatureDependencyConflict[];
}

export interface IFeatureRelationshipResolver {
  resolve(
    candidates: FeatureRelationshipCandidate[],
    existingRelationships?: FeatureRelationship[]
  ): ResolutionResult;
}
