export type ImpactScope =
  | 'RESOURCE'
  | 'SYMBOL'
  | 'FILE'
  | 'MODULE'
  | 'FEATURE'
  | 'SUBSYSTEM'
  | 'REPOSITORY';

export const ALL_IMPACT_SCOPES: readonly ImpactScope[] = [
  'RESOURCE',
  'SYMBOL',
  'FILE',
  'MODULE',
  'FEATURE',
  'SUBSYSTEM',
  'REPOSITORY',
] as const;

export function isValidImpactScope(scope: string): scope is ImpactScope {
  return ALL_IMPACT_SCOPES.includes(scope as ImpactScope);
}
