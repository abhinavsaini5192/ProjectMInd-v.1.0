export type ReasoningDecisionStatus =
  | 'NO_DECISION'
  | 'RECOMMENDATION'
  | 'PROPOSED_CHANGE'
  | 'NEEDS_MORE_INFORMATION'
  | 'READY_FOR_EXECUTION';

export interface ReasoningDecision {
  status: ReasoningDecisionStatus;
  decisionType?: string;
  targets: string[];
  actions: string[];
  constraints: string[];
  requiredVerification: string[];
  summary: string;
}
