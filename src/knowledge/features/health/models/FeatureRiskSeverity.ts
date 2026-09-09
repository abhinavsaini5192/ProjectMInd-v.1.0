export type FeatureRiskSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const FEATURE_RISK_SEVERITIES: readonly FeatureRiskSeverity[] = [
  'INFO',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
] as const;

export function isFeatureRiskSeverity(value: unknown): value is FeatureRiskSeverity {
  return typeof value === 'string' && FEATURE_RISK_SEVERITIES.includes(value as FeatureRiskSeverity);
}
