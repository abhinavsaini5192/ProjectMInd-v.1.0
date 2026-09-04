import { Subtask } from '../models/Subtask';
import { SubtaskDependency } from '../models/SubtaskDependency';

export class DependencyPlanner {
  public planDependencies(subtasks: Subtask[]): SubtaskDependency[] {
    const dependencies: SubtaskDependency[] = [];

    for (const st of subtasks) {
      for (const depId of st.dependencies) {
        dependencies.push({
          sourceSubtaskId: depId,
          targetSubtaskId: st.subtaskId,
          type: 'HARD',
          description: `Subtask ${st.subtaskId} requires completion of ${depId}`
        });
      }
    }

    return dependencies;
  }
}
