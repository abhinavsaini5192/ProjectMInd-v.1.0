export type TaskDecisionType = 'CONTINUE' | 'REPLAN' | 'RETRY' | 'ASK_USER' | 'STOP';

export interface TaskDecision {
  type: TaskDecisionType;
  reason: string;
  confidence: number;
  recommendedAction?: string;
}
