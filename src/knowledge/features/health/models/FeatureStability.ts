import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export type FeatureStabilityLevel =
  | 'STABLE'
  | 'MOSTLY_STABLE'
  | 'UNSTABLE'
  | 'HIGHLY_UNSTABLE'
  | 'UNKNOWN';

export const FEATURE_STABILITY_LEVELS: readonly FeatureStabilityLevel[] = [
  'STABLE',
  'MOSTLY_STABLE',
  'UNSTABLE',
  'HIGHLY_UNSTABLE',
  'UNKNOWN'
] as const;

export function isFeatureStabilityLevel(value: unknown): value is FeatureStabilityLevel {
  return typeof value === 'string' && FEATURE_STABILITY_LEVELS.includes(value as FeatureStabilityLevel);
}

export interface FeatureStabilityMetrics {
  commitCount: number;
  churnScore: number;
  authorCount: number;
  ageInDays: number;
  recentChangesCount: number;
}

export interface FeatureStability {
  score: number; // 0 to 100 (100 = completely stable, 0 = highly volatile/unstable)
  level: FeatureStabilityLevel;
  metrics: FeatureStabilityMetrics;
  confidence: number; // 0 to 1
  evidence: FeatureRiskEvidence[];
}
