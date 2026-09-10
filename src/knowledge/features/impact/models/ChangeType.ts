export type ChangeType =
  | 'CREATED'
  | 'MODIFIED'
  | 'DELETED'
  | 'RENAMED'
  | 'MOVED'
  | 'SIGNATURE_CHANGED'
  | 'API_CHANGED'
  | 'BEHAVIOR_CHANGED'
  | 'DEPENDENCY_CHANGED'
  | 'CONFIGURATION_CHANGED'
  | 'DATA_SCHEMA_CHANGED'
  | 'CONTRACT_CHANGED'
  | 'UNKNOWN';

export const ALL_CHANGE_TYPES: readonly ChangeType[] = [
  'CREATED',
  'MODIFIED',
  'DELETED',
  'RENAMED',
  'MOVED',
  'SIGNATURE_CHANGED',
  'API_CHANGED',
  'BEHAVIOR_CHANGED',
  'DEPENDENCY_CHANGED',
  'CONFIGURATION_CHANGED',
  'DATA_SCHEMA_CHANGED',
  'CONTRACT_CHANGED',
  'UNKNOWN',
] as const;

export function isValidChangeType(type: string): type is ChangeType {
  return ALL_CHANGE_TYPES.includes(type as ChangeType);
}
