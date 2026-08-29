import { LoopStatus } from './LoopState';
import { LoopIterationRecord } from './LoopIterationRecord';

export interface LoopOutcome {
  loopId: string;
  taskId: string;
  status: LoopStatus;
  iterations: LoopIterationRecord[];
  totalDurationMs: number;
  finalDecisionSummary?: string;
  changesApplied: string[];
  verificationPassed: boolean;
  approvalRequired: boolean;
  lineage: {
    taskId: string;
    contextPackageId?: string;
    reasoningId?: string;
    decisionId?: string;
    planId?: string;
    executionId?: string;
  };
  errors: string[];
}
