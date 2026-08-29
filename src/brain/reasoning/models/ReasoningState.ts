import { Hypothesis } from './Hypothesis';
import { Evidence } from './Evidence';
import { KnowledgeGap } from './KnowledgeGap';
import { ClarificationRequest } from './ClarificationRequest';
import { UncertaintyType } from './UncertaintyType';

export interface ReasoningState {
  stateId: string;
  repositoryId: string;
  task: string;
  hypotheses: Hypothesis[];
  allEvidence: Evidence[];
  uncertaintyTypes: UncertaintyType[];
  knowledgeGaps: KnowledgeGap[];
  clarificationRequest?: ClarificationRequest;
  confidence: number;
  decisionThreshold: 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_CONFIDENCE';
  isStale: boolean; // Set to true if underlying L2 knowledge changes
  snapshotId: string;
}
