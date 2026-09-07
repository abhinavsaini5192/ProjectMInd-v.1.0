export type FeatureBehaviorConfidenceLevel =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'VERY_LOW';

export interface FeatureBehaviorConfidence {
  level: FeatureBehaviorConfidenceLevel;
  score: number;
  reasons: string[];
}

export function scoreToFeatureBehaviorConfidenceLevel(score: number): FeatureBehaviorConfidenceLevel {
  const normalized = Math.max(0, Math.min(1, score));
  if (normalized >= 0.90) return 'VERY_HIGH';
  if (normalized >= 0.70) return 'HIGH';
  if (normalized >= 0.45) return 'MEDIUM';
  if (normalized >= 0.20) return 'LOW';
  return 'VERY_LOW';
}
