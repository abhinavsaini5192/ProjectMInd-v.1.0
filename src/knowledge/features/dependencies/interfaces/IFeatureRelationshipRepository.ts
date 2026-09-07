import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyConflict } from '../models/FeatureDependencyConflict';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';

export interface IFeatureRelationshipRepository {
  save(relationship: FeatureRelationship): Promise<void>;
  update(relationship: FeatureRelationship): Promise<void>;
  get(relationshipId: string): Promise<FeatureRelationship | null>;
  getRelationships(featureId: string): Promise<FeatureRelationship[]>;
  getOutgoing(featureId: string): Promise<FeatureRelationship[]>;
  getIncoming(featureId: string): Promise<FeatureRelationship[]>;
  getBetween(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureRelationship | null>;
  getByType(type: FeatureRelationshipType): Promise<FeatureRelationship[]>;
  getAll(): Promise<FeatureRelationship[]>;
  deactivate(relationshipId: string, reason?: string): Promise<void>;
  saveConflict(conflict: FeatureDependencyConflict): Promise<void>;
  queryConflicts(featureId?: string): Promise<FeatureDependencyConflict[]>;
}
