import type { FeatureHealth } from './FeatureHealth.js';
import type { HealthAnalysisMode } from './FeatureHealthVersion.js';

export interface FeatureHealthStatistics {
  averageHealthScore: number;
  averageRiskScore: number;
  statusCounts: Record<string, number>;
  highRiskFeatureIds: string[];
  criticalRiskFeatureIds: string[];
}

export interface FeatureHealthFailure {
  featureId: string;
  error: string;
}

export interface FeatureHealthResult {
  runId: string;
  repositoryId: string;
  analysisMode: HealthAnalysisMode;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  featuresAnalyzed: number;
  featuresUpdated: number;
  signalsDetected: number;
  risksDetected: number;
  conflictsDetected: number;
  staleFeatures: string[];
  failures: FeatureHealthFailure[];
  healthResults: FeatureHealth[];
  statistics: FeatureHealthStatistics;
}
