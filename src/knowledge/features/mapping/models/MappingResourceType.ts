import type { FeatureResourceType } from '../../models/FeatureReference';

export type MappingResourceType =
  | FeatureResourceType
  | 'DATABASE_ENTITY'
  | 'DOCUMENTATION';

export const VALID_MAPPING_RESOURCE_TYPES: readonly MappingResourceType[] = [
  'FILE',
  'SYMBOL',
  'MODULE',
  'PACKAGE',
  'DEPENDENCY',
  'RELATIONSHIP',
  'CONFIGURATION',
  'DATABASE',
  'DATABASE_ENTITY',
  'ENDPOINT',
  'TEST',
  'UI_COMPONENT',
  'COMMAND',
  'DOCUMENTATION',
] as const;
