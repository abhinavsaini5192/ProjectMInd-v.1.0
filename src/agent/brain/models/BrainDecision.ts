export enum DecisionType {
  NO_ACTION = 'NO_ACTION',
  REQUEST_INFORMATION = 'REQUEST_INFORMATION',
  INVESTIGATE = 'INVESTIGATE',
  MODIFY_CODE = 'MODIFY_CODE',
  MODIFY_CONFIGURATION = 'MODIFY_CONFIGURATION',
  RUN_TESTS = 'RUN_TESTS',
  ROLLBACK = 'ROLLBACK',
  ESCALATE = 'ESCALATE'
}

export interface BrainDecision {
  decisionId: string;
  decisionType: DecisionType;
  confidence: number;
  reasoningSummary: string;
  targets: string[];
  actions: any[];
  constraints: string[];
  requiredVerification: string[];
  evidence: string[];
  createdAt: number;
}
