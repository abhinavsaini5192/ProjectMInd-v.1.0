export type MappingConfidenceLevel =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'VERY_LOW';

export interface MappingConfidence {
  level: MappingConfidenceLevel;
  score: number;
  reasons: string[];
}

export function scoreToMappingConfidenceLevel(score: number): MappingConfidenceLevel {
  if (score >= 0.85) return 'VERY_HIGH';
  if (score >= 0.70) return 'HIGH';
  if (score >= 0.45) return 'MEDIUM';
  if (score >= 0.20) return 'LOW';
  return 'VERY_LOW';
}
