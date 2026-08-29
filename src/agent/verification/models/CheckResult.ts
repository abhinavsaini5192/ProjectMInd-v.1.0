export enum CheckStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PARTIAL = 'PARTIAL',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED'
}

export interface CheckEvidence {
  type: string;
  file?: string;
  line?: number;
  message: string;
}

export interface CheckResult {
  checkId: string;
  type: string;
  status: CheckStatus;
  duration: number;
  evidence: CheckEvidence[];
  errors: string[];
  warnings: string[];
}
