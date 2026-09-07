import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehaviorEvidence } from './FeatureBehaviorEvidence';
import type { FeatureFlowEdge } from './FeatureFlowEdge';
import type { FeatureFlowNode } from './FeatureFlowNode';
import type { FeatureFlowType } from './FeatureFlowType';

export type CandidateStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED'
  | 'PROMOTED';

export const VALID_CANDIDATE_STATUSES: readonly CandidateStatus[] = [
  'DETECTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'REJECTED',
  'PROMOTED',
] as const;

export interface FeatureBehaviorCandidate {
  candidateId: string;
  featureId: FeatureId;
  name: string;
  flowType: FeatureFlowType;
  nodes: FeatureFlowNode[];
  edges: FeatureFlowEdge[];
  evidence: FeatureBehaviorEvidence[];
  score: number;
  confidence: number;
  sources: string[];
  conflicts: string[];
  status: CandidateStatus;
  metadata?: Record<string, any>;
  createdAt: number;
}
