import { TaskState } from './TaskState';
import { TaskCycle } from './TaskCycle';

export interface TaskOutcome {
  taskId: string;
  status: TaskState;
  goalAchieved: boolean;
  totalCycles: number;
  cycles: TaskCycle[];
  changesApplied: string[];
  verificationsPassed: string[];
  unresolvedIssues: string[];
  confidence: number;
  durationMs: number;
}
