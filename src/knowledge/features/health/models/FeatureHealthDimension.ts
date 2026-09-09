export type FeatureHealthDimension =
  | 'STRUCTURAL_HEALTH'
  | 'DEPENDENCY_HEALTH'
  | 'BEHAVIOR_HEALTH'
  | 'VERIFICATION_HEALTH'
  | 'ARCHITECTURE_HEALTH'
  | 'STABILITY_HEALTH'
  | 'INTEGRATION_HEALTH'
  | 'SECURITY_HEALTH'
  | 'COMPLEXITY_HEALTH'
  | 'CONFIDENCE_HEALTH';

export const FEATURE_HEALTH_DIMENSIONS: readonly FeatureHealthDimension[] = [
  'STRUCTURAL_HEALTH',
  'DEPENDENCY_HEALTH',
  'BEHAVIOR_HEALTH',
  'VERIFICATION_HEALTH',
  'ARCHITECTURE_HEALTH',
  'STABILITY_HEALTH',
  'INTEGRATION_HEALTH',
  'SECURITY_HEALTH',
  'COMPLEXITY_HEALTH',
  'CONFIDENCE_HEALTH'
] as const;

export function isFeatureHealthDimension(value: unknown): value is FeatureHealthDimension {
  return typeof value === 'string' && FEATURE_HEALTH_DIMENSIONS.includes(value as FeatureHealthDimension);
}

export interface FeatureHealthDimensionResult {
  dimension: FeatureHealthDimension;
  score: number; // 0 to 100
  confidence: number; // 0 to 1
  weight: number; // Normalized weight (e.g. 0.1)
  signalCount: number;
  contributingSignals: string[];
  description: string;
}
