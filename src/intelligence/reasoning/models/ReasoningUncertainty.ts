export type UncertaintyType =
  | 'UNKNOWN'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'AMBIGUOUS_REQUEST';

export interface ReasoningUncertainty {
  type: UncertaintyType;
  reason: string;
  missingInformation?: string[];
}
