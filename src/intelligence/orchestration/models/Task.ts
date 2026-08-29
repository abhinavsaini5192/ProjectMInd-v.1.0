import { TaskState } from './TaskState';
import { TaskGoal } from './TaskGoal';
import { TaskBudget, DEFAULT_TASK_BUDGET } from './TaskBudget';
import { TaskProgress } from './TaskProgress';
import { TaskCycle } from './TaskCycle';
import { TaskOutcome } from './TaskOutcome';

export interface Task {
  taskId: string;
  repositoryId: string;
  workspaceId: string;
  userRequest: string;
  goal: TaskGoal;
  status: TaskState;
  priority: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  currentCycle: number;
  totalCycles: number;
  cycles: TaskCycle[];
  constraints: string[];
  budget: TaskBudget;
  progress: TaskProgress;
  outcome?: TaskOutcome;
  parentTaskId?: string;
}
