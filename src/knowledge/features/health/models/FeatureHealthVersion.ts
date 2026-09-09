export type HealthAnalysisMode = 'FULL' | 'INCREMENTAL' | 'BATCH';

export interface FeatureHealthVersion {
  healthVersion: string;
  knowledgeVersion: string;
  analyzedAt: number;
  analysisMode: HealthAnalysisMode;
  featureId: string;
  healthId: string;
}
