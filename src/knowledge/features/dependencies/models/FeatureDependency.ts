import type { FeatureId } from '../../models/FeatureId';
import type { FeatureRelationshipType } from './FeatureRelationshipType';
import type { FeatureRelationshipConfidence } from './FeatureRelationshipConfidence';

export interface FeatureDependency {
  dependencyId: string;
  dependentFeatureId: FeatureId;
  providerFeatureId: FeatureId;
  type: FeatureRelationshipType;
  strength: number;
  confidence: FeatureRelationshipConfidence;
  isDirect: boolean;
  path?: string[];
  evidenceCount: number;
}
