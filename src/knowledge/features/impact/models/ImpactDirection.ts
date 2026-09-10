export type ImpactDirection =
  | 'DOWNSTREAM'
  | 'UPSTREAM'
  | 'BIDIRECTIONAL'
  | 'UNKNOWN';

export const ALL_IMPACT_DIRECTIONS: readonly ImpactDirection[] = [
  'DOWNSTREAM',
  'UPSTREAM',
  'BIDIRECTIONAL',
  'UNKNOWN',
] as const;

export function isValidImpactDirection(dir: string): dir is ImpactDirection {
  return ALL_IMPACT_DIRECTIONS.includes(dir as ImpactDirection);
}
