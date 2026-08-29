import { RecoveryStrategyType } from './RecoveryPlan';
import { VerificationResult } from '../../verification/models/VerificationResult';

export interface RecoveryAttempt {
  attemptId: string;
  timestamp: number;
  strategy: RecoveryStrategyType;
  failureMessage: string;
  evidence: any[];
  resultingAction?: string;
  result: 'SUCCESS' | 'FAILED';
  verificationResult?: VerificationResult;
}
