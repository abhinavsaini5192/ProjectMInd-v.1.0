export type ActionProposalType = 'CREATE' | 'MODIFY' | 'DELETE' | 'EXECUTE';

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ActionProposal {
  proposalId: string;
  actionType: ActionProposalType;
  resourceUri: string;
  intent: string;
  estimatedImpact: ImpactLevel;
  payload?: any;
  rollbackPlan?: string;
  metadata?: Record<string, any>;
}

export interface ActionProposalDecision {
  proposalId: string;
  approved: boolean;
  reason?: string;
  modifiedProposal?: ActionProposal;
}
