import { TaskProgress } from '../models/TaskProgress';

export class ProgressGuard {
  public checkProgress(currentProgress: TaskProgress, previousProgress?: TaskProgress): boolean {
    if (!previousProgress) return true;

    const madeProgress =
      currentProgress.goalsCompleted.length > previousProgress.goalsCompleted.length ||
      currentProgress.testsPassed > previousProgress.testsPassed ||
      currentProgress.unresolvedIssues.length < previousProgress.unresolvedIssues.length ||
      currentProgress.filesChanged.length > previousProgress.filesChanged.length;

    return madeProgress;
  }
}
