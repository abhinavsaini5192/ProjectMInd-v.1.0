import type { MappingResourceType } from './MappingResourceType';
import type { MappingRole } from './MappingRole';
import type { MappingEvidence } from './MappingEvidence';
import type { MappingConfidence } from './MappingConfidence';
import type { MappingConflict } from './MappingConflict';

export type MappingCandidateStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED'
  | 'PROMOTED';

export interface MappingCandidate {
  candidateId: string;
  featureId: string;
  resourceId: string;
  resourceType: MappingResourceType;
  proposedRole: MappingRole;
  evidence: MappingEvidence[];
  score: number;
  confidence: MappingConfidence;
  sources: MappingResourceType[];
  conflicts: MappingConflict[];
  status: MappingCandidateStatus;
  createdAt: number;
  updatedAt: number;
}
