import { Task } from '../models/Task';
import { TaskState } from '../models/TaskState';
import { TaskOutcome } from '../models/TaskOutcome';

export class TerminationManager {
  public evaluateTermination(task: Task, durationMs: number): TaskOutcome {
    const changesApplied: string[] = [];
    const verificationsPassed: string[] = [];
    const unresolvedIssues: string[] = [];

    for (const cycle of task.cycles) {
      if (cycle.feedbackResult) {
        changesApplied.push(...cycle.feedbackResult.changes.filesModified, ...cycle.feedbackResult.changes.filesAdded);
        unresolvedIssues.push(...cycle.feedbackResult.unresolvedIssues);
        if (cycle.feedbackResult.outcome?.verificationSuccess) {
          verificationsPassed.push(`Cycle ${cycle.cycleNumber}: verification passed`);
        }
      }
    }

    const goalAchieved = task.status === TaskState.COMPLETED;

    return {
      taskId: task.taskId,
      status: task.status,
      goalAchieved,
      totalCycles: task.cycles.length,
      cycles: task.cycles,
      changesApplied: Array.from(new Set(changesApplied)),
      verificationsPassed,
      unresolvedIssues: Array.from(new Set(unresolvedIssues)),
      confidence: goalAchieved ? 0.95 : 0.4,
      durationMs
    };
  }
}
