export enum AgentEventType {
  AGENT_CREATED = 'AgentCreated',
  AGENT_STARTED = 'AgentStarted',
  TASK_RECEIVED = 'TaskReceived',
  UNDERSTANDING_STARTED = 'UnderstandingStarted',
  UNDERSTANDING_COMPLETED = 'UnderstandingCompleted',
  PLANNING_STARTED = 'PlanningStarted',
  PLANNING_COMPLETED = 'PlanningCompleted',
  APPROVAL_REQUESTED = 'ApprovalRequested',
  EXECUTION_STARTED = 'ExecutionStarted',
  VERIFICATION_STARTED = 'VerificationStarted',
  RECOVERY_STARTED = 'RecoveryStarted',
  TASK_COMPLETED = 'TaskCompleted',
  TASK_FAILED = 'TaskFailed',
  AGENT_CANCELLED = 'AgentCancelled'
}

export interface AgentEventPayload {
  agentId: string;
  sessionId: string;
  taskId: string;
  repositoryId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
