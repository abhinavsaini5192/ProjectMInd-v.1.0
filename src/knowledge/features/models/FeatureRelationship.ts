import { FeatureId } from './FeatureId';

export type FeatureRelationshipType =
  | 'DEPENDS_ON'
  | 'CONTAINS'
  | 'EXTENDS'
  | 'SUPPORTS'
  | 'INTEGRATES_WITH'
  | 'CONFLICTS_WITH'
  | 'REQUIRES'
  | 'RELATED_TO';

export interface FeatureRelationship {
  sourceFeatureId: FeatureId;
  targetFeatureId: FeatureId;
  type: FeatureRelationshipType;
  description?: string;
  confidence: number;
}
