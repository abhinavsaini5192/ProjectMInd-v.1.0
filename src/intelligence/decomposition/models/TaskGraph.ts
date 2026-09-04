import { Subtask } from './Subtask';
import { SubtaskDependency } from './SubtaskDependency';

export interface TaskGraph {
  graphId: string;
  taskId: string;
  version: number;
  subtasks: Subtask[];
  dependencies: SubtaskDependency[];
  confidence: number;
  rationale: string;
  createdAt: number;
  updatedAt: number;
}
