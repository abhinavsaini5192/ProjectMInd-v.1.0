export interface DecisionFeedback {
  decisionId: string;
  accepted: boolean;
  modifiedContext: string[]; // IDs of added/removed context
  rejectedContext: string[]; // IDs explicitly rejected by user/agent
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
}
