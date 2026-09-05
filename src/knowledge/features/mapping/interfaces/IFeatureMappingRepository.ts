import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingRole } from '../models/MappingRole';
import type { MappingConflict } from '../models/MappingConflict';

export interface IFeatureMappingRepository {
  save(mapping: FeatureResourceMapping): Promise<void>;
  update(mapping: FeatureResourceMapping): Promise<void>;
  get(mappingId: string): Promise<FeatureResourceMapping | null>;
  getMappings(featureId: string): Promise<FeatureResourceMapping[]>;
  getMappingsByRole(featureId: string, role: MappingRole): Promise<FeatureResourceMapping[]>;
  getResourceFeatures(resourceId: string): Promise<string[]>;
  deactivate(mappingId: string, reason?: string): Promise<void>;
  queryConflicts(featureId?: string): Promise<MappingConflict[]>;
  saveConflict(conflict: MappingConflict): Promise<void>;
  getAll(): Promise<FeatureResourceMapping[]>;
}
