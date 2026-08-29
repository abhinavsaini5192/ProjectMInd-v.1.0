import { TaskGoal } from '../models/TaskGoal';
import { FeedbackResult } from '../../feedback/models/FeedbackResult';

export class GoalManager {
  public parseGoal(userRequest: string): TaskGoal {
    return {
      originalGoal: userRequest,
      normalizedGoal: userRequest.trim(),
      successCriteria: [`Verify "${userRequest}" satisfied with zero test regressions`],
      constraints: ['Respect file permissions and security bounds'],
      requiredEvidence: ['Test execution verification']
    };
  }

  public isGoalAchieved(goal: TaskGoal, feedback: FeedbackResult): boolean {
    return feedback.outcome.objectiveSuccess && feedback.outcome.verificationSuccess;
  }
}
