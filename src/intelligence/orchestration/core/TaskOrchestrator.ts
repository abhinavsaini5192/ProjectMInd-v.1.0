import { Task } from '../models/Task';
import { TaskState } from '../models/TaskState';
import { TaskOutcome } from '../models/TaskOutcome';
import { DEFAULT_TASK_BUDGET } from '../models/TaskBudget';
import { OrchestrationPolicy } from '../policies/OrchestrationPolicy';
import { DEFAULT_ORCHESTRATION_POLICY } from '../policies/DefaultOrchestrationPolicy';
import { TaskLoop } from './TaskLoop';
import { GoalManager } from './GoalManager';
import { TerminationManager } from './TerminationManager';
import { TaskCancelledError } from '../errors/TaskCancelledError';
import { OrchestrationError } from '../errors/OrchestrationError';

export interface TaskRunOptions {
  policy?: OrchestrationPolicy;
  dryRun?: boolean;
  maxCycles?: number;
}

export class TaskOrchestrator {
  private goalManager = new GoalManager();
  private terminationManager = new TerminationManager();
  private activeTasks = new Map<string, Task>();
  private cancelledTaskIds = new Set<string>();

  constructor(private taskLoop: TaskLoop) {}

  public async runTask(
    taskId: string,
    userRequest: string,
    options: TaskRunOptions = {}
  ): Promise<TaskOutcome> {
    const policy = options.policy || DEFAULT_ORCHESTRATION_POLICY;
    const dryRun = options.dryRun || false;
    const startTime = Date.now();

    const goal = this.goalManager.parseGoal(userRequest);
    const budget = {
      ...DEFAULT_TASK_BUDGET,
      maxCycles: options.maxCycles || policy.maxCycles || DEFAULT_TASK_BUDGET.maxCycles
    };

    const task: Task = {
      taskId,
      repositoryId: 'repo_1',
      workspaceId: 'workspace_1',
      userRequest,
      goal,
      status: TaskState.CREATED,
      priority: 1,
      createdAt: startTime,
      startedAt: startTime,
      currentCycle: 0,
      totalCycles: 0,
      cycles: [],
      constraints: goal.constraints,
      budget,
      progress: {
        goalsCompleted: [],
        goalsRemaining: [goal.normalizedGoal],
        stepsCompleted: 0,
        stepsRemaining: 0,
        filesChanged: [],
        testsPassed: 0,
        testsFailed: 0,
        blockers: [],
        unresolvedIssues: [],
        confidence: 0.5
      }
    };

    this.activeTasks.set(taskId, task);

    try {
      while (
        task.status !== TaskState.COMPLETED &&
        task.status !== TaskState.FAILED &&
        task.status !== TaskState.STALLED &&
        task.status !== TaskState.CANCELLED &&
        task.status !== TaskState.WAITING_FOR_APPROVAL &&
        task.status !== TaskState.WAITING_FOR_USER
      ) {
        if (this.cancelledTaskIds.has(taskId)) {
          task.status = TaskState.CANCELLED;
          throw new TaskCancelledError('Task was cancelled by user request', taskId);
        }

        const { requiresUserApproval, question } = await this.taskLoop.executeCycle(task, policy, dryRun);

        if (requiresUserApproval || question) {
          break;
        }

        if (task.status === TaskState.REPLANNING) {
          // Continue to next cycle iteration
          continue;
        }
      }
    } catch (err: any) {
      if (err instanceof TaskCancelledError) {
        task.status = TaskState.CANCELLED;
      } else if (err.name === 'TaskBudgetExceededError' || err.name === 'TaskStalledError') {
        task.status = TaskState.STALLED;
      } else {
        task.status = TaskState.FAILED;
      }
      task.progress.unresolvedIssues.push(err.message);
    } finally {
      task.completedAt = Date.now();
      task.totalCycles = task.cycles.length;
    }

    const outcome = this.terminationManager.evaluateTermination(task, Date.now() - startTime);
    task.outcome = outcome;
    return outcome;
  }

  public cancelTask(taskId: string): void {
    this.cancelledTaskIds.add(taskId);
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = TaskState.CANCELLED;
    }
  }

  public pauseTask(taskId: string): TaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new OrchestrationError(`Task "${taskId}" not found`);
    task.status = TaskState.PAUSED;
    return task.status;
  }

  public resumeTask(taskId: string): TaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new OrchestrationError(`Task "${taskId}" not found`);
    if (task.status !== TaskState.PAUSED) {
      throw new OrchestrationError(`Task "${taskId}" is not paused (current state: ${task.status})`);
    }
    task.status = TaskState.UNDERSTANDING;
    return task.status;
  }

  public previewTask(userRequest: string): { goal: string; estimatedCycles: number; risk: string } {
    const goal = this.goalManager.parseGoal(userRequest);
    return {
      goal: goal.normalizedGoal,
      estimatedCycles: 2,
      risk: 'LOW'
    };
  }
}
