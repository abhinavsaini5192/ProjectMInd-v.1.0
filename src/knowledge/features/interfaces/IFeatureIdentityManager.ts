import { FeatureId } from '../models/FeatureId';

export interface IFeatureIdentityManager {
  createFeatureId(name: string, repositoryId: string): FeatureId;
  validateFeatureId(id: string): void;
  isValidFeatureId(id: string): boolean;
  ensureUniqueFeatureId(id: FeatureId, existingIds: Set<FeatureId>): FeatureId;
}
