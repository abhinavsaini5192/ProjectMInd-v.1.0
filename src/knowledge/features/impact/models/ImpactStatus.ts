export type ImpactStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED'
  | 'PROMOTED'
  | 'STALE';

export const ALL_IMPACT_STATUSES: readonly ImpactStatus[] = [
  'DETECTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'REJECTED',
  'PROMOTED',
  'STALE',
] as const;

export function isValidImpactStatus(status: string): status is ImpactStatus {
  return ALL_IMPACT_STATUSES.includes(status as ImpactStatus);
}
