export type FailureType =
  | 'PRECONDITION_FAILURE'
  | 'TOOL_FAILURE'
  | 'COMMAND_FAILURE'
  | 'TEST_FAILURE'
  | 'BUILD_FAILURE'
  | 'VERIFICATION_FAILURE'
  | 'PLAN_FAILURE'
  | 'KNOWLEDGE_STALE'
  | 'CONFLICT'
  | 'PERMISSION_FAILURE'
  | 'ENVIRONMENT_FAILURE'
  | 'UNKNOWN';

export interface FailureAnalysis {
  failureType: FailureType;
  directCause: string;
  contributingFactors: string[];
  affectedResources: string[];
  failedAssumptions: string[];
  retryable: boolean;
  recommendation: 'RETRY' | 'REPLAN' | 'GATHER_CONTEXT' | 'ASK_USER' | 'STOP';
}
