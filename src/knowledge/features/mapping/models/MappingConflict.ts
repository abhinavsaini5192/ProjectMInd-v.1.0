import type { MappingEvidence } from './MappingEvidence';

export type MappingConflictSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type MappingConflictStatus = 'OPEN' | 'RESOLVED' | 'IGNORED';

export interface MappingConflict {
  conflictId: string;
  featureId: string;
  resourceId: string;
  conflictingMappings: string[];
  reason: string;
  severity: MappingConflictSeverity;
  evidence?: MappingEvidence[];
  status: MappingConflictStatus;
  createdAt: number;
}
