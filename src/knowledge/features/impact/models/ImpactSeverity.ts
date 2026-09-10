export type ImpactSeverity =
  | 'INFO'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export const ALL_IMPACT_SEVERITIES: readonly ImpactSeverity[] = [
  'INFO',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const;

export function isValidImpactSeverity(sev: string): sev is ImpactSeverity {
  return ALL_IMPACT_SEVERITIES.includes(sev as ImpactSeverity);
}
