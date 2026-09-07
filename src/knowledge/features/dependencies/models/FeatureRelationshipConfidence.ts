export type FeatureRelationshipConfidenceLevel =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'VERY_LOW';

export interface FeatureRelationshipConfidence {
  level: FeatureRelationshipConfidenceLevel;
  score: number;
  reasons: string[];
}

export function scoreToFeatureRelationshipConfidenceLevel(score: number): FeatureRelationshipConfidenceLevel {
  const normalized = Math.max(0, Math.min(1, score));
  if (normalized >= 0.90) return 'VERY_HIGH';
  if (normalized >= 0.70) return 'HIGH';
  if (normalized >= 0.45) return 'MEDIUM';
  if (normalized >= 0.20) return 'LOW';
  return 'VERY_LOW';
}
