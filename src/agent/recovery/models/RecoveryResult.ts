import { RecoveryAttempt } from './RecoveryAttempt';
import { VerificationResult } from '../../verification/models/VerificationResult';

export enum RecoveryStatus {
  RECOVERED = 'RECOVERED',
  ROLLED_BACK = 'ROLLED_BACK',
  ESCALATED = 'ESCALATED',
  ABORTED = 'ABORTED',
  UNRESOLVED = 'UNRESOLVED'
}

export interface RecoveryResult {
  recoveryId: string;
  status: RecoveryStatus;
  attempts: RecoveryAttempt[];
  finalState: string;
  originalFailure: string;
  finalVerification?: VerificationResult;
  rollbackState?: string;
  explanation: string;
}
