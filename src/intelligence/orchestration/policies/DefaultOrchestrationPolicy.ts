import { OrchestrationPolicy, AutonomyLevel } from './OrchestrationPolicy';

export const DEFAULT_ORCHESTRATION_POLICY: OrchestrationPolicy = {
  autonomyLevel: AutonomyLevel.LEVEL_2_CONTROLLED,
  allowAutonomousContinuation: true,
  maxCycles: 5,
  maxRetries: 2,
  maxReplans: 3,
  requireApprovalForHighRisk: true,
  allowUserQuestions: true,
  stopOnArchitectureViolation: false,
  stopOnTestRegression: true,
  stopOnUnexpectedChanges: false
};
