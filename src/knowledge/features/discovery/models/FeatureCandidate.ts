import type { FeatureType } from '../../models/FeatureType';
import type { FeatureScope } from '../../models/FeatureScope';
import type { FeatureReference } from '../../models/FeatureReference';
import type { DiscoveryEvidence } from './DiscoveryEvidence';
import type { DiscoveryConfidence } from './DiscoveryConfidence';
import type { DiscoveryConflict } from './DiscoveryConflict';

export type CandidateStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED'
  | 'MERGED'
  | 'PROMOTED';

export interface FeatureCandidate {
  candidateId: string;
  proposedName: string;
  proposedDescription: string;
  type: FeatureType;
  scope: FeatureScope;
  evidence: DiscoveryEvidence[];
  score: number;
  confidence: DiscoveryConfidence;
  sources: string[];
  references: FeatureReference[];
  conflicts: DiscoveryConflict[];
  status: CandidateStatus;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}
