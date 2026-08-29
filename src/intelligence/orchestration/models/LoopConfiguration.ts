export interface LoopConfiguration {
  maxIterations: number;
  timeoutMs: number;
  requireApprovalForHighRisk: boolean;
  autoRollbackOnFailure: boolean;
  enableMemoryLearning: boolean;
}

export const DEFAULT_LOOP_CONFIG: LoopConfiguration = {
  maxIterations: 5,
  timeoutMs: 120000,
  requireApprovalForHighRisk: true,
  autoRollbackOnFailure: true,
  enableMemoryLearning: true
};
