import type { IFeatureMappingEngine } from '../interfaces/IFeatureMappingEngine';
import type { MappingContext } from '../interfaces/IFeatureMappingSource';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingResult } from '../models/MappingResult';
import type { MappingRole } from '../models/MappingRole';

export class FeatureMappingAPI {
  constructor(private engine: IFeatureMappingEngine) {}

  public async mapFeature(featureId: string, context?: MappingContext): Promise<MappingResult> {
    return this.engine.mapFeature(featureId, context);
  }

  public async mapFeatures(featureIds: string[], context?: MappingContext): Promise<MappingResult[]> {
    return this.engine.mapFeatures(featureIds, context);
  }

  public async mapIncremental(changedResourceIds: string[], context?: MappingContext): Promise<MappingResult> {
    return this.engine.mapIncremental(changedResourceIds, context);
  }

  public async getMappings(featureId: string): Promise<FeatureResourceMapping[]> {
    return this.engine.getMappings(featureId);
  }

  public async getMappingsByRole(featureId: string, role: MappingRole): Promise<FeatureResourceMapping[]> {
    return this.engine.getMappingsByRole(featureId, role);
  }

  public async getResourceFeatures(resourceId: string): Promise<string[]> {
    return this.engine.getResourceFeatures(resourceId);
  }

  public async getMapping(mappingId: string): Promise<FeatureResourceMapping | null> {
    return this.engine.getMapping(mappingId);
  }

  public async explain(mappingId: string): Promise<Record<string, any>> {
    return this.engine.explainMapping(mappingId);
  }

  public async validate(mappingId: string): Promise<{ valid: boolean; issues: string[] }> {
    return this.engine.validateMapping(mappingId);
  }

  public async deactivate(mappingId: string, reason?: string): Promise<void> {
    return this.engine.deactivateMapping(mappingId, reason);
  }

  public getRun(runId: string): MappingResult | undefined {
    return this.engine.getMappingRun(runId);
  }
}
