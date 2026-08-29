import { Feature } from '../models/Feature';
import { FeatureId } from '../models/FeatureId';
import { FeatureType } from '../models/FeatureType';
import { FeatureStatus } from '../models/FeatureStatus';

export interface IFeatureRepository {
  create(feature: Feature): Promise<void>;
  get(id: FeatureId): Promise<Feature | null>;
  update(feature: Feature): Promise<void>;
  delete(id: FeatureId): Promise<boolean>;
  exists(id: FeatureId): Promise<boolean>;
  list(repositoryId?: string): Promise<Feature[]>;
  findByName(name: string, repositoryId?: string): Promise<Feature[]>;
  findByReference(resourceId: string): Promise<Feature[]>;
  findByType(type: FeatureType, repositoryId?: string): Promise<Feature[]>;
  findByStatus(status: FeatureStatus, repositoryId?: string): Promise<Feature[]>;
}
