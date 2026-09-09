import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthResult } from '../models/FeatureHealthResult.js';
import type { HealthAnalysisMode } from '../models/FeatureHealthVersion.js';
import type { HealthConfiguration } from './IFeatureHealthSignal.js';

export interface HealthAnalysisOptions {
  workspaceId: string;
  repositoryId: string;
  mode?: HealthAnalysisMode;
  featureIds?: string[];
  config?: Partial<HealthConfiguration>;
  forceRefresh?: boolean;
}

export interface IFeatureHealthEngine {
  analyze(options: HealthAnalysisOptions): Promise<FeatureHealthResult>;
  analyzeFeature(featureId: string, mode?: HealthAnalysisMode): Promise<FeatureHealth>;
  analyzeIncremental(changedFeatureIds: string[]): Promise<FeatureHealthResult>;
  getHealth(featureId: string): Promise<FeatureHealth | null>;
  explain(featureId: string): Promise<string>;
}
