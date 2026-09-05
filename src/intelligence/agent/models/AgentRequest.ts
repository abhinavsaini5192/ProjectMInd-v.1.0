import type { TaskBudget } from '../../orchestration/models/TaskBudget';
import type { OrchestrationPolicy } from '../../orchestration/policies/OrchestrationPolicy';

export type AutonomyLevel =
  | 'LEVEL_0_MANUAL'
  | 'LEVEL_1_ASSISTED'
  | 'LEVEL_2_CONTROLLED'
  | 'LEVEL_3_BOUNDED_AUTONOMOUS';

export interface AgentRequest {
  requestId: string;
  workspaceId: string;
  repositoryId: string;
  userRequest: string;
  autonomyLevel?: AutonomyLevel;
  constraints?: string[];
  budget?: Partial<TaskBudget>;
  dryRun?: boolean;
  approvalMode?: 'AUTOMATIC' | 'EXPLICIT';
  policy?: OrchestrationPolicy;
  metadata?: Record<string, any>;
}
