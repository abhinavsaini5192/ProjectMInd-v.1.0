import type { Feature } from '../../models/Feature';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationship } from '../models/FeatureRelationship';

export interface IFeatureRelationshipValidator {
  validateCandidate(
    candidate: FeatureRelationshipCandidate,
    allFeatures: Map<string, Feature>,
    repositoryId?: string
  ): { valid: boolean; issues: string[] };

  validateRelationship(
    relationship: FeatureRelationship,
    allFeatures: Map<string, Feature>
  ): { valid: boolean; issues: string[] };
}
