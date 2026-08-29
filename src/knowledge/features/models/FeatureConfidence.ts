export enum FeatureConfidenceLevel {
  CONFIRMED = 'CONFIRMED',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNKNOWN = 'UNKNOWN'
}

export interface FeatureConfidence {
  level: FeatureConfidenceLevel;
  score: number;
  reason?: string;
}
