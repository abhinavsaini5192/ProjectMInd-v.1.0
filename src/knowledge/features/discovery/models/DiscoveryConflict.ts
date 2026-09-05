export type ConflictType =
  | 'SCOPE_MISMATCH'
  | 'RESOURCE_COLLISION'
  | 'NAME_COLLISION'
  | 'INCOMPATIBLE_ASSIGNMENT'
  | 'SEMANTIC_CONTRADICTION';

export type ConflictSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface DiscoveryConflict {
  conflictId: string;
  candidateId: string;
  type: ConflictType;
  description: string;
  severity: ConflictSeverity;
  involvedResources: string[];
  competingCandidateIds?: string[];
  resolved: boolean;
}
