export type ImpactType =
  | 'DIRECT'
  | 'INDIRECT'
  | 'BEHAVIORAL'
  | 'DEPENDENCY'
  | 'API'
  | 'DATA'
  | 'INTEGRATION'
  | 'CONFIGURATION'
  | 'ARCHITECTURAL'
  | 'VERIFICATION'
  | 'RESOURCE'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'UNKNOWN';

export const ALL_IMPACT_TYPES: readonly ImpactType[] = [
  'DIRECT',
  'INDIRECT',
  'BEHAVIORAL',
  'DEPENDENCY',
  'API',
  'DATA',
  'INTEGRATION',
  'CONFIGURATION',
  'ARCHITECTURAL',
  'VERIFICATION',
  'RESOURCE',
  'SECURITY',
  'PERFORMANCE',
  'UNKNOWN',
] as const;

export function isValidImpactType(type: string): type is ImpactType {
  return ALL_IMPACT_TYPES.includes(type as ImpactType);
}
