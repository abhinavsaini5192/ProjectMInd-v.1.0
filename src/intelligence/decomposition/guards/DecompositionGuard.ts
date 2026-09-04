import { TaskGraph } from '../models/TaskGraph';
import { DecompositionError } from '../errors/DecompositionError';

export class DecompositionGuard {
  public validateGraph(graph: TaskGraph): void {
    if (!graph.subtasks || graph.subtasks.length === 0) {
      throw new DecompositionError('TaskGraph must contain at least one subtask');
    }

    const subtaskIds = new Set(graph.subtasks.map(s => s.subtaskId));

    // 1. Check all dependencies reference existing subtasks
    for (const dep of graph.dependencies) {
      if (!subtaskIds.has(dep.sourceSubtaskId) || !subtaskIds.has(dep.targetSubtaskId)) {
        throw new DecompositionError(`Dependency references non-existent subtask: ${dep.sourceSubtaskId} -> ${dep.targetSubtaskId}`);
      }
    }

    // 2. Cycle Detection (DFS)
    const adj = new Map<string, string[]>();
    for (const id of subtaskIds) adj.set(id, []);
    for (const dep of graph.dependencies) {
      adj.get(dep.sourceSubtaskId)!.push(dep.targetSubtaskId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      for (const neighbor of adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const id of subtaskIds) {
      if (!visited.has(id)) {
        if (dfs(id)) {
          throw new DecompositionError(`Circular dependency cycle detected in TaskGraph: ${id}`);
        }
      }
    }
  }
}
