export type FeatureRiskType =
  | 'COMPLEXITY'
  | 'COUPLING'
  | 'DEPENDENCY'
  | 'VERIFICATION'
  | 'BEHAVIOR'
  | 'ARCHITECTURE'
  | 'STABILITY'
  | 'INTEGRATION'
  | 'SECURITY'
  | 'CONFIDENCE'
  | 'CIRCULAR_DEPENDENCY'
  | 'RESOURCE_CONCENTRATION';

export const FEATURE_RISK_TYPES: readonly FeatureRiskType[] = [
  'COMPLEXITY',
  'COUPLING',
  'DEPENDENCY',
  'VERIFICATION',
  'BEHAVIOR',
  'ARCHITECTURE',
  'STABILITY',
  'INTEGRATION',
  'SECURITY',
  'CONFIDENCE',
  'CIRCULAR_DEPENDENCY',
  'RESOURCE_CONCENTRATION'
] as const;

export function isFeatureRiskType(value: unknown): value is FeatureRiskType {
  return typeof value === 'string' && FEATURE_RISK_TYPES.includes(value as FeatureRiskType);
}
