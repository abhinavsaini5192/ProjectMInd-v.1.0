import { TaskState } from '../models/TaskState';
import { OrchestrationError } from '../errors/OrchestrationError';

export class TaskStateMachine {
  private static readonly LEGAL_TRANSITIONS: Record<TaskState, TaskState[]> = {
    [TaskState.CREATED]: [TaskState.UNDERSTANDING, TaskState.CANCELLED],
    [TaskState.UNDERSTANDING]: [TaskState.CONTEXT_GATHERING, TaskState.WAITING_FOR_USER, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.CONTEXT_GATHERING]: [TaskState.REASONING, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.REASONING]: [TaskState.PLANNING, TaskState.WAITING_FOR_USER, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.PLANNING]: [TaskState.PLAN_VALIDATION, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.PLAN_VALIDATION]: [TaskState.WAITING_FOR_APPROVAL, TaskState.EXECUTING, TaskState.REPLANNING, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.WAITING_FOR_APPROVAL]: [TaskState.EXECUTING, TaskState.PAUSED, TaskState.CANCELLED, TaskState.TERMINATED],
    [TaskState.EXECUTING]: [TaskState.VERIFYING, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.VERIFYING]: [TaskState.ANALYZING, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.ANALYZING]: [TaskState.COMPLETED, TaskState.PARTIALLY_COMPLETED, TaskState.REPLANNING, TaskState.WAITING_FOR_USER, TaskState.FAILED, TaskState.STALLED],
    [TaskState.REPLANNING]: [TaskState.PLANNING, TaskState.REASONING, TaskState.FAILED, TaskState.CANCELLED],
    [TaskState.WAITING_FOR_USER]: [TaskState.REASONING, TaskState.PLANNING, TaskState.PAUSED, TaskState.CANCELLED, TaskState.TERMINATED],
    [TaskState.PAUSED]: [TaskState.UNDERSTANDING, TaskState.REASONING, TaskState.PLANNING, TaskState.EXECUTING, TaskState.CANCELLED],
    [TaskState.COMPLETED]: [],
    [TaskState.PARTIALLY_COMPLETED]: [],
    [TaskState.FAILED]: [],
    [TaskState.BLOCKED]: [],
    [TaskState.CANCELLED]: [],
    [TaskState.STALLED]: [],
    [TaskState.TERMINATED]: []
  };

  public transition(currentState: TaskState, targetState: TaskState): TaskState {
    const allowed = TaskStateMachine.LEGAL_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new OrchestrationError(`Illegal state transition from ${currentState} to ${targetState}`);
    }
    return targetState;
  }
}
