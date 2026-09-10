export type ImpactSource =
  | 'MAPPING'
  | 'DEPENDENCY'
  | 'BEHAVIOR'
  | 'RESOURCE_RELATIONSHIP'
  | 'ENDPOINT'
  | 'DATA'
  | 'INTEGRATION'
  | 'TEST'
  | 'ARCHITECTURE'
  | 'HEALTH_RISK'
  | 'MANUAL'
  | 'UNKNOWN';

export const ALL_IMPACT_SOURCES: readonly ImpactSource[] = [
  'MAPPING',
  'DEPENDENCY',
  'BEHAVIOR',
  'RESOURCE_RELATIONSHIP',
  'ENDPOINT',
  'DATA',
  'INTEGRATION',
  'TEST',
  'ARCHITECTURE',
  'HEALTH_RISK',
  'MANUAL',
  'UNKNOWN',
] as const;

export function isValidImpactSource(src: string): src is ImpactSource {
  return ALL_IMPACT_SOURCES.includes(src as ImpactSource);
}
