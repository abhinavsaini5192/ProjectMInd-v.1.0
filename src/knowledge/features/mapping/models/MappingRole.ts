import type { FeatureReferenceRole } from '../../models/FeatureReference';

export type MappingRole =
  | FeatureReferenceRole
  | 'COMMAND'
  | 'INTEGRATION'
  | 'ORCHESTRATION'
  | 'INFRASTRUCTURE';

export const VALID_MAPPING_ROLES: readonly MappingRole[] = [
  'ENTRY_POINT',
  'IMPLEMENTATION',
  'SUPPORT',
  'DEPENDENCY',
  'CONFIGURATION',
  'STORAGE',
  'TEST',
  'VERIFICATION',
  'API',
  'UI',
  'COMMAND',
  'DOCUMENTATION',
  'OBSERVABILITY',
  'INTEGRATION',
  'ORCHESTRATION',
  'INFRASTRUCTURE',
] as const;
