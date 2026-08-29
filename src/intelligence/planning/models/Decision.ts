import { DecisionFactor } from './DecisionFactor';

export type DecisionType =
  | 'NO_ACTION'
  | 'INVESTIGATE'
  | 'MODIFY'
  | 'CREATE'
  | 'DELETE'
  | 'REFACTOR'
  | 'CONFIGURE'
  | 'DOCUMENT'
  | 'DEFER'
  | 'NEEDS_INFORMATION';

export type DecisionStatus = 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'DEFERRED';

export interface Decision {
  decisionId: string;
  reasoningId: string;
  taskId: string;
  type: DecisionType;
  statement: string;
  confidence: number;
  factors: DecisionFactor[];
  evidenceIds: string[];
  alternatives?: string[];
  assumptions?: string[];
  uncertainty?: string[];
  rationale: string;
  status: DecisionStatus;
  createdAt: number;
}
