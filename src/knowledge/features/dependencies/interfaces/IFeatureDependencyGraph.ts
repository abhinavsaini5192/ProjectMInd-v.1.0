import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyPath } from '../models/FeatureDependencyPath';
import type { FeatureDependencyCycle } from '../models/FeatureDependencyCycle';

export interface IFeatureDependencyGraph {
  addFeature(feature: Feature): void;
  removeFeature(featureId: string): void;
  addRelationship(relationship: FeatureRelationship): void;
  removeRelationship(relationshipId: string): void;

  getFeature(featureId: string): Feature | undefined;
  getAllFeatures(): Feature[];

  getDependencies(featureId: string): Feature[];
  getDependents(featureId: string): Feature[];

  getRelationships(featureId: string): FeatureRelationship[];
  getOutgoingRelationships(featureId: string): FeatureRelationship[];
  getIncomingRelationships(featureId: string): FeatureRelationship[];

  getRelationship(sourceId: string, targetId: string): FeatureRelationship | undefined;
  hasRelationship(sourceId: string, targetId: string): boolean;

  findPath(sourceId: string, targetId: string): FeatureDependencyPath | null;
  findDependencyChain(featureId: string): {
    upstream: Feature[];
    downstream: Feature[];
    paths: FeatureDependencyPath[];
  };

  detectCycles(): FeatureDependencyCycle[];
  getNeighbors(featureId: string): Feature[];
  getIsolatedFeatures(): Feature[];

  size(): { nodes: number; edges: number };
  clear(): void;
}
