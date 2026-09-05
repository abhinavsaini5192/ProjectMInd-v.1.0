export type MappingSourceType =
  | 'MANUAL'
  | 'DISCOVERED'
  | 'INFERRED'
  | 'IMPORTED';

export const VALID_MAPPING_SOURCES: readonly MappingSourceType[] = [
  'MANUAL',
  'DISCOVERED',
  'INFERRED',
  'IMPORTED',
] as const;
