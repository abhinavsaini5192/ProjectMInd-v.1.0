import { ContextCandidate } from './ContextCandidate';
import { InformationGap } from './InformationGap';

export interface ContextExclusion {
  resourceId: string;
  reason: string;
}

export interface ContextSelection {
  selectionId: string;
  subtaskId: string;
  selectedCandidates: ContextCandidate[];
  excludedCandidates: ContextExclusion[];
  selectionReason: string;
  totalTokens: number;
  confidence: number;
  informationGaps: InformationGap[];
  createdAt: number;
}
