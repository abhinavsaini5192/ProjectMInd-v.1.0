import { TaskOrchestrator } from '../../orchestration/core/TaskOrchestrator';
import type { TaskRunOptions } from '../../orchestration/core/TaskOrchestrator';
import { DecompositionEngine } from '../../decomposition/core/DecompositionEngine';
import type { Task } from '../../orchestration/models/Task';
import { TaskState } from '../../orchestration/models/TaskState';
import type { TaskOutcome } from '../../orchestration/models/TaskOutcome';
import { DEFAULT_ORCHESTRATION_POLICY } from '../../orchestration/policies/DefaultOrchestrationPolicy';
import { AutonomyLevel } from '../../orchestration/policies/OrchestrationPolicy';
import type { OrchestrationPolicy } from '../../orchestration/policies/OrchestrationPolicy';
import { DEFAULT_TASK_BUDGET } from '../../orchestration/models/TaskBudget';
import type { AgentRequest } from '../models/AgentRequest';
import type { AgentResponse, ChangedResource } from '../models/AgentResponse';
import type {
  TaskReport,
  TimelineEvent,
  ContextReportSummary,
  ReasoningReportSummary,
  ExecutionReportSummary,
  VerificationReportSummary,
} from '../models/TaskReport';
import { AuditTrail } from '../observability/AuditTrail';
import { AgentMetrics } from '../observability/AgentMetrics';
import type { AgentMetricsSnapshot } from '../observability/AgentMetrics';
import { PlanFreshnessValidator } from '../hardening/PlanFreshnessValidator';
import { SecuritySanitizer } from '../hardening/SecuritySanitizer';
import { BrainBoundaryGateway } from '../boundary/BrainBoundaryGateway';
import { FailureTaxonomy } from '../taxonomy/FailureTaxonomy';
import { AgentSecurityError } from '../errors/AgentSecurityError';

export interface ProjectMindAgentConfig {
  orchestrator: TaskOrchestrator;
  decompositionEngine?: DecompositionEngine | undefined;
  auditTrail?: AuditTrail | undefined;
  metrics?: AgentMetrics | undefined;
  freshnessValidator?: PlanFreshnessValidator | undefined;
  brainGateway?: BrainBoundaryGateway | undefined;
}

export class ProjectMindAgent {
  private orchestrator: TaskOrchestrator;
  private decompositionEngine?: DecompositionEngine | undefined;
  private auditTrail: AuditTrail;
  private metrics: AgentMetrics;
  private freshnessValidator?: PlanFreshnessValidator | undefined;
  private brainGateway?: BrainBoundaryGateway | undefined;

  constructor(config: ProjectMindAgentConfig) {
    this.orchestrator = config.orchestrator;
    this.decompositionEngine = config.decompositionEngine;
    this.auditTrail = config.auditTrail || new AuditTrail();
    this.metrics = config.metrics || new AgentMetrics();
    this.freshnessValidator = config.freshnessValidator;
    this.brainGateway = config.brainGateway;
  }

  /**
   * Create and register a task with security validation and audit logging
   */
  public async createTask(request: AgentRequest): Promise<Task> {
    this.validateAutonomyLevel(request.autonomyLevel);

    // Prompt injection check
    SecuritySanitizer.checkPromptInjection(request.userRequest, true);

    const taskId = request.requestId;
    this.metrics.recordTaskStart();

    this.auditTrail.record({
      requestId: request.requestId,
      taskId,
      category: 'REQUEST',
      action: 'TASK_CREATED',
      actor: 'USER',
      status: 'COMPLETED',
      details: {
        workspaceId: request.workspaceId,
        repositoryId: request.repositoryId,
        autonomyLevel: request.autonomyLevel,
        dryRun: request.dryRun,
      },
    });

    // Create placeholder task or obtain from preview
    const preview = this.orchestrator.previewTask(request.userRequest);
    const now = Date.now();

    const task: Task = {
      taskId,
      repositoryId: request.repositoryId,
      workspaceId: request.workspaceId,
      userRequest: request.userRequest,
      goal: {
        originalGoal: request.userRequest,
        normalizedGoal: preview.goal,
        successCriteria: [],
        constraints: request.constraints || [],
        requiredEvidence: [],
      },
      status: TaskState.CREATED,
      priority: 1,
      createdAt: now,
      currentCycle: 0,
      totalCycles: 0,
      cycles: [],
      constraints: request.constraints || [],
      budget: {
        ...DEFAULT_TASK_BUDGET,
        ...(request.budget || {}),
      },
      progress: {
        goalsCompleted: [],
        goalsRemaining: [preview.goal],
        stepsCompleted: 0,
        stepsRemaining: 0,
        filesChanged: [],
        testsPassed: 0,
        testsFailed: 0,
        blockers: [],
        unresolvedIssues: [],
        confidence: 0.5,
      },
    };

    return task;
  }

  /**
   * Execute an end-to-end task through the orchestrator with feedback and hardening
   */
  public async runTask(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    const taskId = request.requestId;

    try {
      this.validateAutonomyLevel(request.autonomyLevel);
      SecuritySanitizer.checkPromptInjection(request.userRequest, true);

      this.auditTrail.record({
        requestId: request.requestId,
        taskId,
        category: 'REQUEST',
        action: 'TASK_EXECUTION_STARTED',
        actor: 'USER',
        status: 'STARTED',
        details: { userRequest: SecuritySanitizer.redactSecrets(request.userRequest) },
      });

      // Optional decomposition for complex tasks
      if (this.decompositionEngine && (request.userRequest.length > 80 || request.constraints?.length)) {
        try {
          const taskGraph = this.decompositionEngine.decomposeTask(
            taskId,
            request.userRequest
          );
          this.auditTrail.record({
            requestId: request.requestId,
            taskId,
            category: 'PLANNING',
            action: 'TASK_DECOMPOSED',
            actor: 'AGENT',
            status: 'COMPLETED',
            details: {
              subtasksCount: taskGraph.subtasks.length,
              confidence: taskGraph.confidence,
            },
          });
        } catch {
          // Gracefully fallback to standard loop if decomposition has non-fatal issues
        }
      }

      // Configure policy based on autonomy level
      const policy = this.buildPolicyForAutonomy(request);

      const runOptions: TaskRunOptions = {
        policy,
        dryRun: request.dryRun || false,
        ...(request.budget?.maxCycles !== undefined ? { maxCycles: request.budget.maxCycles } : {}),
      };

      const outcome = await this.orchestrator.runTask(taskId, request.userRequest, runOptions);

      const durationMs = Date.now() - startTime;
      const statusStr = outcome.goalAchieved ? 'SUCCESS' : this.mapTaskStateToOutcome(outcome.status);

      this.metrics.recordTaskEnd(statusStr, durationMs, outcome.totalCycles);

      this.auditTrail.record({
        requestId: request.requestId,
        taskId,
        category: 'REQUEST',
        action: 'TASK_EXECUTION_FINISHED',
        actor: 'SYSTEM',
        status: outcome.goalAchieved ? 'COMPLETED' : 'FAILED',
        details: { status: outcome.status, goalAchieved: outcome.goalAchieved },
      });

      return this.buildAgentResponse(taskId, outcome, request);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const failureRecord = FailureTaxonomy.classify(err, 'ProjectMindAgent');

      if (failureRecord.category === 'SECURITY_ERROR') {
        this.metrics.recordSecurityViolation();
      } else if (failureRecord.category === 'MODEL_ERROR') {
        this.metrics.recordValidationError();
      } else if (failureRecord.category === 'PLANNING_ERROR') {
        this.metrics.recordFreshnessError();
      }

      this.metrics.recordTaskEnd('FAILED', durationMs, 1);

      this.auditTrail.record({
        requestId: request.requestId,
        taskId,
        category: 'ERROR',
        action: 'TASK_EXECUTION_ERROR',
        actor: 'SYSTEM',
        status: 'FAILED',
        details: { category: failureRecord.category, message: failureRecord.message },
      });

      // If fatal security error or forbidden autonomy, rethrow
      if (err instanceof AgentSecurityError) {
        throw err;
      }

      // Return structured failed response
      return {
        taskId,
        outcome: 'FAILED',
        summary: `Task failed due to ${failureRecord.category}: ${failureRecord.message}`,
        progress: { percent: 0, completedCycles: 1, maxCycles: request.budget?.maxCycles || 5 },
        changedResources: [],
        verification: { passed: false, details: failureRecord.message },
        unresolvedIssues: [failureRecord.message],
        nextAction: failureRecord.recoveryAction,
        auditReference: this.auditTrail.getEntriesForTask(taskId)[0]?.id || taskId,
        metrics: this.metrics.getSnapshot() as any,
      };
    }
  }

  public async pauseTask(taskId: string): Promise<TaskState> {
    const state = this.orchestrator.pauseTask(taskId);
    this.auditTrail.record({
      taskId,
      category: 'REQUEST',
      action: 'TASK_PAUSED',
      actor: 'USER',
      status: 'INFO',
    });
    return state;
  }

  public async resumeTask(taskId: string): Promise<TaskState> {
    const state = this.orchestrator.resumeTask(taskId);
    this.auditTrail.record({
      taskId,
      category: 'REQUEST',
      action: 'TASK_RESUMED',
      actor: 'USER',
      status: 'INFO',
    });
    return state;
  }

  public async cancelTask(taskId: string): Promise<void> {
    this.orchestrator.cancelTask(taskId);
    this.auditTrail.record({
      taskId,
      category: 'REQUEST',
      action: 'TASK_CANCELLED',
      actor: 'USER',
      status: 'INFO',
    });
  }

  public async getTask(taskId: string): Promise<Task | null> {
    return this.orchestrator.getTask(taskId) || null;
  }

  public async getTaskStatus(taskId: string): Promise<TaskState | null> {
    const task = await this.getTask(taskId);
    return task ? task.status : null;
  }

  public async getTaskHistory(taskId: string): Promise<any> {
    const task = await this.getTask(taskId);
    const auditEntries = this.auditTrail.getEntriesForTask(taskId);
    return {
      task,
      auditEntries,
      cycles: task?.cycles || [],
    };
  }

  public async explainTask(taskId: string): Promise<TaskReport> {
    const task = await this.getTask(taskId);
    const auditEntries = this.auditTrail.getEntriesForTask(taskId);

    const timeline: TimelineEvent[] = auditEntries.map((e) => ({
      timestamp: e.timestamp,
      stage: e.category,
      summary: `${e.action} (${e.status})`,
      ...(e.details ? { metadata: e.details } : {}),
    }));

    const contextSummary: ContextReportSummary = {
      itemsConsidered: task?.cycles.reduce((acc, c) => acc + (c.contextSnapshot?.items?.length || 0), 0) || 0,
      tokensUsed: task?.cycles.reduce((acc, c) => acc + (c.contextSnapshot?.totalTokens || 0), 0) || 0,
      keyFiles: Array.from(new Set(task?.progress.filesChanged || [])),
      totalBudgetTokens: task?.budget.maxContextTokens || 20000,
    };

    const reasoningSummary: ReasoningReportSummary = {
      keyHypotheses: task?.cycles
        .flatMap((c) => c.reasoningResult?.hypotheses?.map((h) => h.statement) || [])
        .filter(Boolean) || [],
      decisionsMade: task?.cycles
        .map((c) => c.reasoningResult?.decision?.decisionType || (c.reasoningResult?.decision as any)?.type || c.reasoningResult?.decision?.status || '')
        .filter(Boolean) || [],
      assumptions: task?.cycles.flatMap((c) => c.reasoningResult?.assumptions || []) || [],
    };

    const executionSummary: ExecutionReportSummary = {
      actionsAttempted: (task?.progress.stepsCompleted || 0) + (task?.progress.stepsRemaining || 0),
      actionsSucceeded: task?.progress.stepsCompleted || 0,
      actionsFailed: task?.progress.unresolvedIssues?.length || 0,
      changesApplied: task?.outcome?.changesApplied || [],
    };

    const verificationSummary: VerificationReportSummary = {
      verified: Boolean(task?.outcome?.verificationsPassed?.length),
      checksPassed: task?.outcome?.verificationsPassed?.length || 0,
      checksFailed: task?.progress.testsFailed || 0,
      ...(task?.outcome?.verificationsPassed?.length ? { details: task.outcome.verificationsPassed.join(', ') } : {}),
    };

    return {
      taskId,
      summary: task ? `Task ${task.taskId}: ${task.status}` : 'Task not found',
      outcome: task?.outcome?.status || task?.status || 'UNKNOWN',
      durationMs: task?.completedAt && task?.startedAt ? task.completedAt - task.startedAt : 0,
      timeline,
      contextSummary,
      reasoningSummary,
      executionSummary,
      verificationSummary,
      generatedAt: Date.now(),
    };
  }

  public async explainContext(taskId: string): Promise<ContextReportSummary> {
    const report = await this.explainTask(taskId);
    return report.contextSummary;
  }

  public async explainDecision(taskId: string): Promise<ReasoningReportSummary> {
    const report = await this.explainTask(taskId);
    return report.reasoningSummary;
  }

  public async previewTask(request: AgentRequest): Promise<{ goal: string; estimatedCycles: number; risk: string; subtasks?: any[] }> {
    this.validateAutonomyLevel(request.autonomyLevel);
    const basePreview = this.orchestrator.previewTask(request.userRequest);

    let subtasks: any[] | undefined;
    if (this.decompositionEngine) {
      try {
        const decomp = this.decompositionEngine.decomposeTask('preview', request.userRequest);
        subtasks = decomp.subtasks;
      } catch {
        // Ignore preview decomposition failure
      }
    }

    return {
      ...basePreview,
      ...(subtasks ? { subtasks } : {}),
    };
  }

  public getMetrics(): AgentMetricsSnapshot {
    return this.metrics.getSnapshot();
  }

  public getAuditTrail(): AuditTrail {
    return this.auditTrail;
  }

  private validateAutonomyLevel(level?: string): void {
    if (!level) return;
    const normalized = level.toUpperCase();
    if (normalized.includes('LEVEL_4') || normalized.includes('UNRESTRICTED') || normalized.includes('AUTONOMOUS_UNBOUNDED')) {
      this.metrics.recordSecurityViolation();
      throw new AgentSecurityError(
        'Autonomy Level 4 (Unrestricted Autonomy) is strictly forbidden for security reasons.',
        'FORBIDDEN_AUTONOMY',
        { level }
      );
    }
  }

  private buildPolicyForAutonomy(request: AgentRequest): OrchestrationPolicy {
    const basePolicy = request.policy || DEFAULT_ORCHESTRATION_POLICY;

    if (request.autonomyLevel === 'LEVEL_0_MANUAL') {
      return {
        ...basePolicy,
        autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
        requireApprovalForHighRisk: true,
        allowAutonomousContinuation: false,
      };
    }
    if (request.autonomyLevel === 'LEVEL_1_ASSISTED') {
      return {
        ...basePolicy,
        autonomyLevel: AutonomyLevel.LEVEL_1_ASSISTED,
        requireApprovalForHighRisk: true,
        allowAutonomousContinuation: false,
      };
    }
    if (request.autonomyLevel === 'LEVEL_2_CONTROLLED') {
      return {
        ...basePolicy,
        autonomyLevel: AutonomyLevel.LEVEL_2_CONTROLLED,
        requireApprovalForHighRisk: true,
        allowAutonomousContinuation: true,
      };
    }
    if (request.autonomyLevel === 'LEVEL_3_BOUNDED_AUTONOMOUS') {
      return {
        ...basePolicy,
        autonomyLevel: AutonomyLevel.LEVEL_3_BOUNDED_AUTONOMOUS,
        requireApprovalForHighRisk: false,
        allowAutonomousContinuation: true,
      };
    }

    return basePolicy;
  }

  private mapTaskStateToOutcome(state: TaskState): 'SUCCESS' | 'FAILED' | 'STALLED' | 'CANCELLED' | 'IN_PROGRESS' | 'PAUSED' {
    switch (state) {
      case TaskState.COMPLETED:
        return 'SUCCESS';
      case TaskState.FAILED:
      case TaskState.TERMINATED:
        return 'FAILED';
      case TaskState.STALLED:
      case TaskState.BLOCKED:
        return 'STALLED';
      case TaskState.CANCELLED:
        return 'CANCELLED';
      case TaskState.PAUSED:
        return 'PAUSED';
      default:
        return 'IN_PROGRESS';
    }
  }

  private buildAgentResponse(taskId: string, outcome: TaskOutcome, request: AgentRequest): AgentResponse {
    const outcomeStr = outcome.goalAchieved ? 'SUCCESS' : this.mapTaskStateToOutcome(outcome.status);
    const changedResources: ChangedResource[] = (outcome.changesApplied || []).map((uri) => ({
      uri,
      action: 'MODIFIED',
      status: 'APPLIED',
    }));

    const maxCycles = request.budget?.maxCycles || 5;
    const progressPercent = outcome.goalAchieved
      ? 100
      : Math.min(95, Math.round((outcome.totalCycles / maxCycles) * 100));

    return {
      taskId,
      outcome: outcomeStr,
      summary: outcome.goalAchieved
        ? `Task completed successfully in ${outcome.totalCycles} cycles.`
        : `Task concluded with status ${outcome.status}.`,
      progress: {
        percent: progressPercent,
        completedCycles: outcome.totalCycles,
        maxCycles,
      },
      changedResources,
      verification: {
        passed: outcome.goalAchieved || outcome.verificationsPassed.length > 0,
        details: outcome.verificationsPassed.join(', ') || (outcome.goalAchieved ? 'All goal criteria verified' : 'No verifications recorded'),
        verifiedAt: Date.now(),
        checksCount: outcome.verificationsPassed.length || (outcome.goalAchieved ? 1 : 0),
      },
      unresolvedIssues: outcome.unresolvedIssues || [],
      nextAction: outcome.goalAchieved ? 'NONE' : 'REPAIR_PLAN',
      auditReference: this.auditTrail.getEntriesForTask(taskId)[0]?.id || taskId,
      metrics: this.metrics.getSnapshot() as any,
    };
  }
}
