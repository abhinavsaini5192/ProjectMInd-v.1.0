export type GoalStatus = 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED' | 'UNKNOWN';

export interface GoalEvaluation {
  goalStatus: GoalStatus;
  explanation: string;
  evidenceIds: string[];
  confidence: number;
}
