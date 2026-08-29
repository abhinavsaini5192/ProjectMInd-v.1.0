import { SLMTaskType } from './SLMTaskType';

export interface BenchmarkCase {
  caseId: string;
  taskType: SLMTaskType;
  taskDescription: string;
  intentType: string;
  repositoryId: string;
  
  // Ground truth
  expectedContext: string[];
  expectedFeatures: string[];
  
  // Predictions for this run
  deterministicPrediction?: string[];
  slmPrediction?: string[];
  
  // Result
  hallucinatedEntities?: string[];
}

export interface SLMMetrics {
  contextPrecision: number;
  contextRecall: number;
  missingContextRate: number;
  hallucinationRate: number;
  avgLatencyMs: number;
  fallbackRate: number;
}

export interface BenchmarkReport {
  reportId: string;
  model: string;
  version: string;
  metrics: SLMMetrics;
  casesEvaluated: number;
  timestamp: number;
}
