import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyPath } from '../models/FeatureDependencyPath';
import type { FeatureDependencyCycle } from '../models/FeatureDependencyCycle';
import type { FeatureDependencyResult } from '../models/FeatureDependencyResult';
import type { IFeatureDependencyEngine } from '../interfaces/IFeatureDependencyEngine';
import type { DependencyContext } from '../interfaces/IFeatureRelationshipSource';

export class FeatureDependencyAPI {
  constructor(private engine: IFeatureDependencyEngine) {}

  public async discover(featureId: string, context?: DependencyContext): Promise<FeatureDependencyResult> {
    return this.engine.discoverRelationships(featureId, context);
  }

  public async discoverForFeatures(featureIds: string[], context?: DependencyContext): Promise<FeatureDependencyResult[]> {
    return this.engine.discoverRelationshipsForFeatures(featureIds, context);
  }

  public async buildCompleteGraph(context?: DependencyContext): Promise<FeatureDependencyResult> {
    return this.engine.buildCompleteGraph(context);
  }

  public async updateIncremental(changedResourceIds: string[], context?: DependencyContext): Promise<FeatureDependencyResult> {
    return this.engine.updateIncremental(changedResourceIds, context);
  }

  public async getDependencies(featureId: string): Promise<Feature[]> {
    return this.engine.getDependencies(featureId);
  }

  public async getDependents(featureId: string): Promise<Feature[]> {
    return this.engine.getDependents(featureId);
  }

  public async getRelationships(featureId: string): Promise<FeatureRelationship[]> {
    return this.engine.getRelationships(featureId);
  }

  public async getRelationship(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureRelationship | null> {
    return this.engine.getRelationship(sourceFeatureId, targetFeatureId);
  }

  public async findPath(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureDependencyPath | null> {
    return this.engine.findPath(sourceFeatureId, targetFeatureId);
  }

  public async findDependencyChain(featureId: string): Promise<{
    upstream: Feature[];
    downstream: Feature[];
    paths: FeatureDependencyPath[];
  }> {
    return this.engine.findDependencyChain(featureId);
  }

  public async detectCycles(): Promise<FeatureDependencyCycle[]> {
    return this.engine.detectCycles();
  }

  public async explain(relationshipId: string): Promise<Record<string, any>> {
    return this.engine.explainRelationship(relationshipId);
  }

  public getRun(runId: string): FeatureDependencyResult | undefined {
    return this.engine.getDependencyRun(runId);
  }
}
