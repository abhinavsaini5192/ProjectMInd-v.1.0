import { AgentPermission } from '../../security/models/AgentPermission';
import { SecurityDecision } from '../../security/models/SecurityDecision';

export interface ExecutionContext {
  executionId: string;
  taskId: string;
  planId: string;
  repositoryRoot: string;
  workspaceRoot: string;
  permissions: AgentPermission[];
  policyDecisions: Map<string, SecurityDecision>; // Mapping actionId -> decision
  environmentMetadata: Record<string, string>;
  isCancelled: boolean;
  dryRun: boolean;
}
