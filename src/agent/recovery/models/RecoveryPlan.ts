import { FailureCategory } from '../classification/FailureCategory';
import { FailureSeverity } from '../classification/FailureSeverity';

export enum RecoveryStrategyType {
  RETRY = 'RETRY',
  ROLLBACK = 'ROLLBACK',
  REPAIR = 'REPAIR',
  ESCALATE = 'ESCALATE',
  NO_ACTION = 'NO_ACTION'
}

export interface RecoveryPlan {
  strategy: RecoveryStrategyType;
  failureCategory: FailureCategory;
  severity: FailureSeverity;
  affectedFiles: string[];
  affectedSymbols: string[];
  reason: string;
  constraints: string[];
  attemptNumber: number;
  maximumAttempts: number;
}
