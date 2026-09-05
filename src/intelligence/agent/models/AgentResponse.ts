export interface ChangedResource {
  uri: string;
  action: 'CREATED' | 'MODIFIED' | 'DELETED' | 'EXECUTED';
  status: 'PENDING' | 'APPLIED' | 'FAILED' | 'ROLLED_BACK';
  summary?: string;
}

export interface VerificationSummary {
  passed: boolean;
  details?: string;
  verifiedAt?: number;
  checksCount?: number;
}

export interface TaskProgressSummary {
  percent: number;
  completedCycles: number;
  maxCycles: number;
}

export interface AgentResponse {
  taskId: string;
  outcome: 'SUCCESS' | 'FAILED' | 'STALLED' | 'CANCELLED' | 'IN_PROGRESS' | 'PAUSED';
  summary: string;
  progress: TaskProgressSummary;
  changedResources: ChangedResource[];
  verification: VerificationSummary;
  unresolvedIssues: string[];
  nextAction: string;
  auditReference: string;
  metrics?: Record<string, any>;
  metadata?: Record<string, any>;
}
