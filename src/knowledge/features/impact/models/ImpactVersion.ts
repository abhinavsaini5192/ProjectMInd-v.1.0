export type AnalysisMode = 'FULL' | 'INCREMENTAL';

export interface ImpactVersion {
  impactVersion: number;
  knowledgeVersion: string;
  sourceChangeVersion: string;
  analyzedAt: number;
  analysisMode: AnalysisMode;
  metadata?: Record<string, any>;
}
