import { Subtask } from '../models/Subtask';
import { SubtaskDependency } from '../models/SubtaskDependency';
import { TaskGraph } from '../models/TaskGraph';

export class TaskGraphBuilder {
  public buildGraph(
    taskId: string,
    subtasks: Subtask[],
    dependencies: SubtaskDependency[],
    version: number = 1,
    rationale: string = 'Initial task decomposition'
  ): TaskGraph {
    return {
      graphId: `graph_${taskId}_v${version}`,
      taskId,
      version,
      subtasks,
      dependencies,
      confidence: 0.95,
      rationale,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}
