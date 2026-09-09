import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export type FeatureCriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const FEATURE_CRITICALITY_LEVELS: readonly FeatureCriticalityLevel[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
] as const;

export function isFeatureCriticalityLevel(value: unknown): value is FeatureCriticalityLevel {
  return typeof value === 'string' && FEATURE_CRITICALITY_LEVELS.includes(value as FeatureCriticalityLevel);
}

export interface FeatureCriticalityMetrics {
  dependentCount: number;
  exportCount: number;
  endpointCount: number;
  entryPointCount: number;
  coreDomain: boolean;
}

export interface FeatureCriticality {
  score: number; // 0 to 100
  level: FeatureCriticalityLevel;
  metrics: FeatureCriticalityMetrics;
  confidence: number; // 0 to 1
  evidence: FeatureRiskEvidence[];
}
