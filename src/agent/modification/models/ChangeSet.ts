import { ModificationOperation } from './ModificationIntent';
import { ModificationImpact } from './ModificationImpact';

export interface PatchRange {
  startLine: number;
  endLine: number;
}

export interface ChangeSet {
  changeId: string;
  actionId: string;
  file: string;
  operation: ModificationOperation;
  targetSymbol?: string;
  beforeHash: string;
  afterHash: string;
  
  // The actual diff text
  patch: string;
  affectedRange?: PatchRange;
  
  impact: ModificationImpact;
}
