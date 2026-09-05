export type DiscoveryConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface DiscoveryConfidence {
  level: DiscoveryConfidenceLevel;
  score: number;
  reasons: string[];
}

export function scoreToConfidenceLevel(score: number): DiscoveryConfidenceLevel {
  if (score >= 0.85) return 'VERY_HIGH';
  if (score >= 0.70) return 'HIGH';
  if (score >= 0.50) return 'MEDIUM';
  if (score >= 0.30) return 'LOW';
  return 'VERY_LOW';
}
