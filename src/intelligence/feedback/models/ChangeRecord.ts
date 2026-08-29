export type ChangeOperation =
  | 'CREATED'
  | 'MODIFIED'
  | 'DELETED'
  | 'MOVED'
  | 'RENAMED'
  | 'DEPENDENCY_CHANGED'
  | 'ARCHITECTURE_CHANGED';

export interface ChangeRecord {
  resourceId: string;
  resourceType: 'FILE' | 'SYMBOL' | 'DEPENDENCY' | 'ARCHITECTURE' | 'CONFIGURATION';
  operation: ChangeOperation;
  beforeState?: string;
  afterState?: string;
  source: string;
  executionId: string;
  confidence: number;
}
