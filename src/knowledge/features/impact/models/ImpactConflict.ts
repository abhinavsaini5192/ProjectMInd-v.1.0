import type { ImpactEvidence } from './ImpactEvidence.js';
import type { ImpactSeverity } from './ImpactSeverity.js';

export type ConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED'
  | 'IGNORED'
  | 'SUPERSEDED';

export interface ImpactConflict {
  conflictId: string;
  sourceFeatureId?: string;
  targetFeatureId: string;
  conflictType: string;
  competingEvidence: ImpactEvidence[];
  severity: ImpactSeverity;
  confidence: number;
  resolutionStatus: ConflictResolutionStatus;
  resolutionNotes?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}
