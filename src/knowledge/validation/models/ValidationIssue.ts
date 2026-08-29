import { Severity } from './Severity';

export interface ValidationIssue {
  domain: 'ast' | 'symbols' | 'relationships' | 'dependencies' | 'features' | 'evolution' | 'crossLayer';
  entityId: string;
  message: string;
  severity: Severity;
}
