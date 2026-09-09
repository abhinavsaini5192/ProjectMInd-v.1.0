export type HealthSignalSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const HEALTH_SIGNAL_SEVERITIES: readonly HealthSignalSeverity[] = [
  'INFO',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const;

export const VALID_HEALTH_SIGNAL_SEVERITIES = HEALTH_SIGNAL_SEVERITIES;

export function isHealthSignalSeverity(severity: unknown): severity is HealthSignalSeverity {
  return typeof severity === 'string' && HEALTH_SIGNAL_SEVERITIES.includes(severity as HealthSignalSeverity);
}

export const isValidHealthSignalSeverity = isHealthSignalSeverity;
