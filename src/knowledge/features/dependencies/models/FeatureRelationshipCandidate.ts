import type { FeatureRelationshipType } from './FeatureRelationshipType';
import type { FeatureRelationshipDirection } from './FeatureRelationshipDirection';
import type { FeatureRelationshipConfidence } from './FeatureRelationshipConfidence';
import type { FeatureRelationshipEvidence } from './FeatureRelationshipEvidence';

export type CandidateStatus = 'DETECTED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED' | 'PROMOTED';

export interface FeatureRelationshipCandidate {
  candidateId: string;
  sourceFeatureId: string;
  targetFeatureId: string;
  proposedType: FeatureRelationshipType;
  direction: FeatureRelationshipDirection;
  evidence: FeatureRelationshipEvidence[];
  score: number;
  confidence: FeatureRelationshipConfidence;
  sources: string[];
  conflicts: string[];
  status: CandidateStatus;
  createdAt: number;
  updatedAt: number;
}
