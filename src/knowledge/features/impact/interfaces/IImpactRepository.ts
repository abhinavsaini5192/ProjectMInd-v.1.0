import type { ImpactResult } from '../models/ImpactResult.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactConflict } from '../models/ImpactConflict.js';

export interface ImpactQueryFilters {
  featureId?: string;
  resourceId?: string;
  impactType?: string;
  minSeverity?: string;
  minScore?: number;
  activeOnly?: boolean;
}

export interface IImpactRepository {
  saveResult(result: ImpactResult): Promise<void>;
  getResult(runId: string): Promise<ImpactResult | null>;
  getLatestResult(repositoryId: string): Promise<ImpactResult | null>;
  getFeatureImpacts(featureId: string, activeOnly?: boolean): Promise<FeatureImpact[]>;
  getResourceImpacts(resourceId: string, activeOnly?: boolean): Promise<ResourceImpact[]>;
  getAllFeatureImpacts(filters?: ImpactQueryFilters): Promise<FeatureImpact[]>;
  getAllResourceImpacts(filters?: ImpactQueryFilters): Promise<ResourceImpact[]>;
  getImpactPath(pathId: string): Promise<ImpactPath | null>;
  findImpactPaths(sourceId: string, targetId: string): Promise<ImpactPath[]>;
  getConflicts(runId?: string): Promise<ImpactConflict[]>;
  markStale(impactIds: string[], reason: string): Promise<void>;
  invalidateByFeature(featureId: string, reason: string): Promise<void>;
  clear(): Promise<void>;
}
