import { CheckResult } from './CheckResult';

export enum OverallStatus {
  VERIFIED = 'VERIFIED',
  PARTIALLY_VERIFIED = 'PARTIALLY_VERIFIED',
  FAILED = 'FAILED',
  UNVERIFIED = 'UNVERIFIED'
}

export interface VerificationResult {
  verificationId: string;
  taskId: string;
  planId: string;
  executionId: string;
  overallStatus: OverallStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  checks: CheckResult[];
  failures: string[];
  warnings: string[];
  unexpectedChanges: string[];
  missingChanges: string[];
  recommendations: string[];
}
