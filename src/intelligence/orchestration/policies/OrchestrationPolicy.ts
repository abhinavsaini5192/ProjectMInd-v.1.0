export enum AutonomyLevel {
  LEVEL_0_MANUAL = 'LEVEL_0_MANUAL',
  LEVEL_1_ASSISTED = 'LEVEL_1_ASSISTED',
  LEVEL_2_CONTROLLED = 'LEVEL_2_CONTROLLED',
  LEVEL_3_BOUNDED_AUTONOMOUS = 'LEVEL_3_BOUNDED_AUTONOMOUS'
}

export interface OrchestrationPolicy {
  autonomyLevel: AutonomyLevel;
  allowAutonomousContinuation: boolean;
  maxCycles: number;
  maxRetries: number;
  maxReplans: number;
  requireApprovalForHighRisk: boolean;
  allowUserQuestions: boolean;
  stopOnArchitectureViolation: boolean;
  stopOnTestRegression: boolean;
  stopOnUnexpectedChanges: boolean;
}
