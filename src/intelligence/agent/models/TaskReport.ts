export interface TimelineEvent {
  timestamp: number;
  stage: string;
  summary: string;
  cycleIndex?: number;
  metadata?: Record<string, any>;
}

export interface ContextReportSummary {
  itemsConsidered: number;
  tokensUsed: number;
  keyFiles: string[];
  totalBudgetTokens: number;
}

export interface ReasoningReportSummary {
  keyHypotheses: string[];
  decisionsMade: string[];
  assumptions: string[];
}

export interface ExecutionReportSummary {
  actionsAttempted: number;
  actionsSucceeded: number;
  actionsFailed: number;
  changesApplied: string[];
}

export interface VerificationReportSummary {
  verified: boolean;
  checksPassed: number;
  checksFailed: number;
  details?: string;
}

export interface TaskReport {
  taskId: string;
  requestId?: string;
  summary: string;
  outcome: string;
  durationMs: number;
  timeline: TimelineEvent[];
  contextSummary: ContextReportSummary;
  reasoningSummary: ReasoningReportSummary;
  executionSummary: ExecutionReportSummary;
  verificationSummary: VerificationReportSummary;
  auditTrailId?: string;
  generatedAt: number;
}
