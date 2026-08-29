import { GoalEvaluation } from './GoalEvaluation';
import { FailureAnalysis } from './FailureAnalysis';
import { SuccessAnalysis } from './SuccessAnalysis';

export interface OutcomeAnalysis {
  outcomeId: string;
  executionId: string;
  executionSuccess: boolean;
  objectiveSuccess: boolean;
  verificationSuccess: boolean;
  goalEvaluation: GoalEvaluation;
  failureAnalysis?: FailureAnalysis;
  successAnalysis?: SuccessAnalysis;
  unexpectedChanges: string[];
  unresolvedIssues: string[];
}
