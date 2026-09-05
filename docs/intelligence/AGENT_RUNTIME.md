# ProjectMind Agent Runtime

## Overview

The `ProjectMindAgent` serves as the single unified entry point for all higher-level intelligence operations within ProjectMind. It wraps the `TaskOrchestrator`, `DecompositionEngine`, and underlying execution adapters into an audit-logged, hardened runtime.

## Interface & API

```typescript
export class ProjectMindAgent {
  constructor(config: ProjectMindAgentConfig);

  public createTask(request: AgentRequest): Promise<Task>;
  public runTask(request: AgentRequest): Promise<AgentResponse>;
  public pauseTask(taskId: string): Promise<TaskState>;
  public resumeTask(taskId: string): Promise<TaskState>;
  public cancelTask(taskId: string): Promise<void>;
  public getTask(taskId: string): Promise<Task | null>;
  public getTaskStatus(taskId: string): Promise<TaskState | null>;
  public getTaskHistory(taskId: string): Promise<any>;
  public explainTask(taskId: string): Promise<TaskReport>;
  public explainContext(taskId: string): Promise<ContextReportSummary>;
  public explainDecision(taskId: string): Promise<ReasoningReportSummary>;
  public previewTask(request: AgentRequest): Promise<{ goal: string; estimatedCycles: number; risk: string; subtasks?: any[] }>;
  public getMetrics(): AgentMetricsSnapshot;
  public getAuditTrail(): AuditTrail;
}
```

## Request Model

```typescript
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
```

## Response Model

```typescript
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
```

## Task Lifecycle States

1. `CREATED`: Initialized and registered with budget guards.
2. `UNDERSTANDING`: Task goal normalization and constraint extraction.
3. `CONTEXT_GATHERING`: Vector retrieval, prompt synthesis, and token budgeting.
4. `REASONING`: Structured reasoning with domain strategies.
5. `PLANNING`: Dependency graph construction and ActionPlan generation.
6. `PLAN_VALIDATION`: Preconditions check and plan freshness verification.
7. `WAITING_FOR_APPROVAL`: Gated when policies or autonomy levels require human sign-off.
8. `EXECUTING`: Controlled tool invocation (file writes, commands, patch applications).
9. `VERIFYING`: Postcondition checks, test runs, and assertions.
10. `ANALYZING`: Feedback analysis, change detection, and learning loop candidates.
11. `REPLANNING`: If goal is not yet satisfied and cycle budget permits.
12. `COMPLETED` / `FAILED` / `STALLED` / `CANCELLED`: Terminal states.
