import { LoopStatus } from '../models/LoopState';
import { LoopConfiguration, DEFAULT_LOOP_CONFIG } from '../models/LoopConfiguration';
import { LoopIterationRecord } from '../models/LoopIterationRecord';
import { LoopOutcome } from '../models/LoopOutcome';
import { ContextEngine } from '../../context/core/ContextEngine';
import { StructuredReasoningEngine } from '../../reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../planning/core/PlanningCoordinator';
import { ReasoningTaskType } from '../../reasoning/models/ReasoningTask';
import { ExecutionBridge } from './ExecutionBridge';
import { VerificationBridge } from './VerificationBridge';
import { RecoveryBridge } from './RecoveryBridge';
import { MemoryFeedbackBridge } from './MemoryFeedbackBridge';

export class AutonomousAgentLoop {
  private executionBridge = new ExecutionBridge();
  private verificationBridge = new VerificationBridge();
  private recoveryBridge = new RecoveryBridge();
  private memoryBridge = new MemoryFeedbackBridge();

  constructor(
    private contextEngine: ContextEngine,
    private reasoningEngine: StructuredReasoningEngine,
    private planningCoordinator: PlanningCoordinator,
    private config: LoopConfiguration = DEFAULT_LOOP_CONFIG
  ) {}

  public async runLoop(taskId: string, intent: string): Promise<LoopOutcome> {
    const loopId = `loop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();
    const iterations: LoopIterationRecord[] = [];
    let currentIteration = 1;
    let loopStatus: LoopStatus = LoopStatus.INITIALIZING;
    const appliedChanges: string[] = [];
    const loopErrors: string[] = [];
    let approvalRequired = false;

    let lineage: LoopOutcome['lineage'] = { taskId };

    while (currentIteration <= this.config.maxIterations) {
      const iterRecord: LoopIterationRecord = {
        iterationNumber: currentIteration,
        startedAt: Date.now(),
        completedAt: Date.now(),
        errors: []
      };

      try {
        // 1. Context & Brain Understanding
        loopStatus = LoopStatus.THINKING;
        const contextPackage = await this.contextEngine.buildContext(intent);
        lineage.contextPackageId = contextPackage.packageId;

        // 2. Structured Reasoning
        const reasoningTaskType = this.mapIntentToTaskType(intent);
        const reasoning = await this.reasoningEngine.reason({
          taskId,
          type: reasoningTaskType,
          objective: intent,
          contextPackage
        });
        iterRecord.reasoning = reasoning;
        lineage.reasoningId = reasoning.reasoningId;

        // 3. Decision & Action Planning
        loopStatus = LoopStatus.PLANNING;
        const outcome = this.planningCoordinator.processReasoning(reasoning);
        iterRecord.decision = outcome.decision;
        iterRecord.plan = outcome.plan;
        lineage.decisionId = outcome.decision.decisionId;
        lineage.planId = outcome.plan.planId;

        // 4. Execution Gate: Check for Approval Requirement
        if (outcome.validationReport.requiresApproval || outcome.plan.status === 'NEEDS_APPROVAL') {
          loopStatus = LoopStatus.AWAITING_APPROVAL;
          approvalRequired = true;
          iterRecord.completedAt = Date.now();
          iterations.push(iterRecord);
          break;
        }

        if (!outcome.validationReport.valid) {
          loopErrors.push(...outcome.validationReport.issues);
          iterRecord.errors = outcome.validationReport.issues;
          iterRecord.completedAt = Date.now();
          iterations.push(iterRecord);
          currentIteration++;
          continue;
        }

        // 5. Execution Bridge
        loopStatus = LoopStatus.EXECUTING;
        const execResult = await this.executionBridge.executePlan(outcome.plan);
        lineage.executionId = execResult.executionId;
        appliedChanges.push(...execResult.changesApplied);
        iterRecord.executionStatus = execResult.success ? 'SUCCEEDED' : 'FAILED';

        // 6. Verification Bridge
        loopStatus = LoopStatus.VERIFYING;
        const verifReport = await this.verificationBridge.verify(outcome.plan, execResult.success);
        iterRecord.verificationPassed = verifReport.passed;

        if (verifReport.passed) {
          loopStatus = LoopStatus.COMPLETED;
          iterRecord.completedAt = Date.now();
          iterations.push(iterRecord);
          break;
        }

        // 7. Recovery Bridge
        loopStatus = LoopStatus.RECOVERING;
        iterRecord.recoveryTriggered = true;
        const recovery = this.recoveryBridge.evaluateFailure(
          outcome.plan,
          verifReport,
          currentIteration,
          this.config.maxIterations
        );

        if (recovery.rollbackRequired) {
          loopStatus = LoopStatus.FAILED;
          loopErrors.push(recovery.reason);
          iterRecord.completedAt = Date.now();
          iterations.push(iterRecord);
          break;
        }

      } catch (err: any) {
        loopErrors.push(err.message);
        iterRecord.errors?.push(err.message);
        loopStatus = LoopStatus.FAILED;
        iterRecord.completedAt = Date.now();
        iterations.push(iterRecord);
        break;
      }

      iterRecord.completedAt = Date.now();
      iterations.push(iterRecord);
      currentIteration++;
    }

    if (loopStatus !== LoopStatus.COMPLETED && loopStatus !== LoopStatus.AWAITING_APPROVAL) {
      loopStatus = LoopStatus.FAILED;
    }

    const finalOutcome: LoopOutcome = {
      loopId,
      taskId,
      status: loopStatus,
      iterations,
      totalDurationMs: Date.now() - startTime,
      finalDecisionSummary: iterations[iterations.length - 1]?.decision?.statement,
      changesApplied: appliedChanges,
      verificationPassed: loopStatus === LoopStatus.COMPLETED,
      approvalRequired,
      lineage,
      errors: loopErrors
    };

    // 8. Memory Learning Feedback Bridge
    if (this.config.enableMemoryLearning) {
      await this.memoryBridge.recordOutcome(finalOutcome);
    }

    return finalOutcome;
  }

  private mapIntentToTaskType(intent: string): ReasoningTaskType {
    const lower = intent.toLowerCase();
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
      return ReasoningTaskType.BUG_ANALYSIS;
    }
    if (lower.includes('review') || lower.includes('audit')) {
      return ReasoningTaskType.CODE_REVIEW;
    }
    if (lower.includes('arch') || lower.includes('design')) {
      return ReasoningTaskType.ARCHITECTURE_ANALYSIS;
    }
    return ReasoningTaskType.GENERAL_ANALYSIS;
  }
}
