import type { FeatureRelationship } from './FeatureRelationship';

export interface FeatureDependencyPath {
  sourceFeatureId: string;
  targetFeatureId: string;
  nodes: string[];
  relationships: FeatureRelationship[];
  totalConfidence: number;
  pathLength: number;
}
