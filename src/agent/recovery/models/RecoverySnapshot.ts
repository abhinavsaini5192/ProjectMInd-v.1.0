import { VerificationResult } from '../../verification/models/VerificationResult';

export interface RecoverySnapshot {
  executionId: string;
  taskId: string;
  planId: string;
  changeId: string;
  affectedFiles: string[];
  beforeHashes: Record<string, string>;
  afterHashes: Record<string, string>;
  verificationState: VerificationResult;
  recoveryAttempt: number;
}
