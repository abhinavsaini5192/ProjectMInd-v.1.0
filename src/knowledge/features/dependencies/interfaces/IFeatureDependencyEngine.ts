import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyPath } from '../models/FeatureDependencyPath';
import type { FeatureDependencyCycle } from '../models/FeatureDependencyCycle';
import type { FeatureDependencyResult } from '../models/FeatureDependencyResult';
import type { DependencyContext } from './IFeatureRelationshipSource';

export interface IFeatureDependencyEngine {
  discoverRelationships(featureId: string, context?: DependencyContext): Promise<FeatureDependencyResult>;
  discoverRelationshipsForFeatures(featureIds: string[], context?: DependencyContext): Promise<FeatureDependencyResult[]>;
  buildCompleteGraph(context?: DependencyContext): Promise<FeatureDependencyResult>;
  updateIncremental(changedResourceIds: string[], context?: DependencyContext): Promise<FeatureDependencyResult>;

  getDependencies(featureId: string): Promise<Feature[]>;
  getDependents(featureId: string): Promise<Feature[]>;
  getRelationships(featureId: string): Promise<FeatureRelationship[]>;
  getRelationship(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureRelationship | null>;

  findPath(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureDependencyPath | null>;
  findDependencyChain(featureId: string): Promise<{
    upstream: Feature[];
    downstream: Feature[];
    paths: FeatureDependencyPath[];
  }>;

  detectCycles(): Promise<FeatureDependencyCycle[]>;
  explainRelationship(relationshipId: string): Promise<Record<string, any>>;
  getDependencyRun(runId: string): FeatureDependencyResult | undefined;
}
