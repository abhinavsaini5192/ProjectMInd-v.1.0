import { Task } from '../models/Task';
import { TaskState } from '../models/TaskState';
import { TaskStateMachine } from './TaskStateMachine';
import { CycleManager } from './CycleManager';
import { GoalManager } from './GoalManager';
import { BudgetGuard } from '../guards/BudgetGuard';
import { LoopGuard } from '../guards/LoopGuard';
import { ApprovalGuard } from '../guards/ApprovalGuard';
import { OrchestrationPolicy } from '../policies/OrchestrationPolicy';
import { ContextAdapter } from '../integration/ContextAdapter';
import { ReasoningAdapter } from '../integration/ReasoningAdapter';
import { PlanningAdapter } from '../integration/PlanningAdapter';
import { ExecutionAdapter } from '../integration/ExecutionAdapter';
import { FeedbackAdapter } from '../integration/FeedbackAdapter';

export class TaskLoop {
  private stateMachine = new TaskStateMachine();
  private cycleManager = new CycleManager();
  private goalManager = new GoalManager();
  private budgetGuard = new BudgetGuard();
  private loopGuard = new LoopGuard();
  private approvalGuard = new ApprovalGuard();

  constructor(
    private contextAdapter: ContextAdapter,
    private reasoningAdapter: ReasoningAdapter,
    private planningAdapter: PlanningAdapter,
    private executionAdapter: ExecutionAdapter,
    private feedbackAdapter: FeedbackAdapter
  ) {}

  public async executeCycle(
    task: Task,
    policy: OrchestrationPolicy,
    dryRun: boolean = false
  ): Promise<{ task: Task; requiresUserApproval?: boolean; question?: string }> {
    const cycleStartTime = Date.now();
    const cycle = this.cycleManager.createCycle(task.taskId);
    task.currentCycle = cycle.cycleNumber;
    task.cycles.push(cycle);

    // 1. Budget & Loop Checks
    this.budgetGuard.checkBudget(task, Date.now() - (task.startedAt || cycleStartTime));
    this.loopGuard.detectLoops(task.cycles);

    // 2. State: UNDERSTANDING -> CONTEXT_GATHERING
    task.status = this.stateMachine.transition(task.status, TaskState.UNDERSTANDING);
    task.status = this.stateMachine.transition(task.status, TaskState.CONTEXT_GATHERING);
    const contextPackage = await this.contextAdapter.gatherContext(task.userRequest);
    cycle.contextSnapshot = contextPackage;

    // 3. State: CONTEXT_GATHERING -> REASONING
    task.status = this.stateMachine.transition(task.status, TaskState.REASONING);
    const reasoningResult = await this.reasoningAdapter.executeReasoning(task.taskId, task.userRequest, contextPackage);
    cycle.reasoningResult = reasoningResult;

    // Check if reasoning requires user clarification
    if (reasoningResult.decision.status === 'NEEDS_MORE_INFORMATION' || reasoningResult.uncertainties?.length) {
      task.status = this.stateMachine.transition(task.status, TaskState.WAITING_FOR_USER);
      return {
        task,
        question: `Clarification needed: ${reasoningResult.uncertainties?.[0] || 'Ambiguous requirement'}`
      };
    }

    // 4. State: REASONING -> PLANNING -> PLAN_VALIDATION
    task.status = this.stateMachine.transition(task.status, TaskState.PLANNING);
    const plan = await this.planningAdapter.createPlan(reasoningResult);
    cycle.planId = plan.planId;

    task.status = this.stateMachine.transition(task.status, TaskState.PLAN_VALIDATION);

    // 5. Check Approval Requirement
    if (this.approvalGuard.requiresApproval(plan, policy)) {
      task.status = this.stateMachine.transition(task.status, TaskState.WAITING_FOR_APPROVAL);
      return {
        task,
        requiresUserApproval: true
      };
    }

    // 6. State: PLAN_VALIDATION -> EXECUTING
    task.status = this.stateMachine.transition(task.status, TaskState.EXECUTING);
    const executionResult = await this.executionAdapter.execute(plan, dryRun);
    cycle.executionId = executionResult.executionId;

    // 7. State: EXECUTING -> VERIFYING -> ANALYZING
    task.status = this.stateMachine.transition(task.status, TaskState.VERIFYING);
    task.status = this.stateMachine.transition(task.status, TaskState.ANALYZING);

    const feedbackResult = await this.feedbackAdapter.analyzeExecution(executionResult, plan, dryRun);
    cycle.feedbackId = feedbackResult.feedbackId;
    cycle.feedbackResult = feedbackResult;

    // 8. Goal Evaluation & Final State Transition
    if (this.goalManager.isGoalAchieved(task.goal, feedbackResult)) {
      task.status = this.stateMachine.transition(task.status, TaskState.COMPLETED);
      this.cycleManager.completeCycle(cycle, 'SUCCESS');
    } else {
      if (task.currentCycle < task.budget.maxCycles && policy.allowAutonomousContinuation) {
        task.status = this.stateMachine.transition(task.status, TaskState.REPLANNING);
        this.cycleManager.completeCycle(cycle, 'FAILED_REPLANNING');
      } else {
        task.status = this.stateMachine.transition(task.status, TaskState.FAILED);
        this.cycleManager.completeCycle(cycle, 'FAILED_TERMINAL');
      }
    }

    return { task };
  }
}
