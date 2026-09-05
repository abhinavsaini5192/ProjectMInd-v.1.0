import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingResult } from '../models/MappingResult';
import type { MappingRole } from '../models/MappingRole';
import type { MappingContext } from './IFeatureMappingSource';

export interface IFeatureMappingEngine {
  mapFeature(featureId: string, context?: MappingContext): Promise<MappingResult>;
  mapFeatures(featureIds: string[], context?: MappingContext): Promise<MappingResult[]>;
  mapIncremental(changedResourceIds: string[], context?: MappingContext): Promise<MappingResult>;
  getMappings(featureId: string): Promise<FeatureResourceMapping[]>;
  getMappingsByRole(featureId: string, role: MappingRole): Promise<FeatureResourceMapping[]>;
  getResourceFeatures(resourceId: string): Promise<string[]>;
  getMapping(mappingId: string): Promise<FeatureResourceMapping | null>;
  explainMapping(mappingId: string): Promise<Record<string, any>>;
  validateMapping(mappingId: string): Promise<{ valid: boolean; issues: string[] }>;
  deactivateMapping(mappingId: string, reason?: string): Promise<void>;
  getMappingRun(runId: string): MappingResult | undefined;
}
