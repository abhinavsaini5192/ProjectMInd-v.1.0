import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthStatus } from '../models/FeatureHealthStatus.js';
import type { FeatureRiskSeverity } from '../models/FeatureRiskSeverity.js';

export interface HealthQueryFilter {
  status?: FeatureHealthStatus;
  minHealthScore?: number;
  maxHealthScore?: number;
  minRiskScore?: number;
  highestRiskSeverity?: FeatureRiskSeverity;
  isStale?: boolean;
}

export interface IFeatureHealthRepository {
  save(health: FeatureHealth): Promise<void>;
  saveBatch(healths: FeatureHealth[]): Promise<void>;
  getById(healthId: string): Promise<FeatureHealth | null>;
  getByFeatureId(featureId: string): Promise<FeatureHealth | null>;
  getAll(filter?: HealthQueryFilter): Promise<FeatureHealth[]>;
  delete(healthId: string): Promise<boolean>;
  markStale(featureIds: string[]): Promise<void>;
  clear(): Promise<void>;
}
