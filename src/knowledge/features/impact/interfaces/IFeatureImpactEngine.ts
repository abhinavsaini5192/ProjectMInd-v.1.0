import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { ImpactResult } from '../models/ImpactResult.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactAnalysisOptions } from './IImpactSource.js';

export interface IFeatureImpactEngine {
  analyzeChange(change: ChangeImpact, options?: ImpactAnalysisOptions): Promise<ImpactResult>;
  analyzeChanges(changes: ChangeImpact[], options?: ImpactAnalysisOptions): Promise<ImpactResult>;
  analyzeIncremental(changes: ChangeImpact[], options?: ImpactAnalysisOptions): Promise<ImpactResult>;
  analyzeResource(resourceId: string, options?: ImpactAnalysisOptions): Promise<ImpactResult>;
  analyzeFeature(featureId: string, options?: ImpactAnalysisOptions): Promise<ImpactResult>;
  getImpact(impactId: string): Promise<FeatureImpact | ResourceImpact | null>;
  findImpactPaths(sourceId: string, targetId: string): Promise<ImpactPath[]>;
  invalidateImpact(impactId: string): Promise<void>;
  invalidateByFeature(featureId: string, reason?: string): Promise<void>;
}
