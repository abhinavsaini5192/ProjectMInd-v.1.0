import { SubtaskPlanner } from './SubtaskPlanner';
import { DependencyPlanner } from './DependencyPlanner';
import { TaskGraphBuilder } from './TaskGraphBuilder';
import { DecompositionGuard } from '../guards/DecompositionGuard';
import { TaskGraph } from '../models/TaskGraph';

export class TaskDecomposer {
  private subtaskPlanner = new SubtaskPlanner();
  private dependencyPlanner = new DependencyPlanner();
  private graphBuilder = new TaskGraphBuilder();
  private guard = new DecompositionGuard();

  public decomposeTask(taskId: string, goalText: string, version: number = 1): TaskGraph {
    const subtasks = this.subtaskPlanner.planSubtasks(taskId, goalText);
    const dependencies = this.dependencyPlanner.planDependencies(subtasks);
    const graph = this.graphBuilder.buildGraph(taskId, subtasks, dependencies, version, `Decomposed task: ${goalText}`);

    this.guard.validateGraph(graph);
    return graph;
  }
}
