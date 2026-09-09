export type FeatureHealthStatus =
  | 'HEALTHY'
  | 'STABLE'
  | 'ATTENTION_REQUIRED'
  | 'DEGRADED'
  | 'HIGH_RISK'
  | 'CRITICAL'
  | 'UNKNOWN';

export const FEATURE_HEALTH_STATUSES: readonly FeatureHealthStatus[] = [
  'HEALTHY',
  'STABLE',
  'ATTENTION_REQUIRED',
  'DEGRADED',
  'HIGH_RISK',
  'CRITICAL',
  'UNKNOWN',
] as const;

export const VALID_FEATURE_HEALTH_STATUSES = FEATURE_HEALTH_STATUSES;

export function isFeatureHealthStatus(status: unknown): status is FeatureHealthStatus {
  return typeof status === 'string' && FEATURE_HEALTH_STATUSES.includes(status as FeatureHealthStatus);
}

export const isValidFeatureHealthStatus = isFeatureHealthStatus;
