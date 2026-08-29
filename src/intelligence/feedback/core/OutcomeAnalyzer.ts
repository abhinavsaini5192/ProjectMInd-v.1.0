import { ExecutionObservation } from '../models/ExecutionObservation';
import { ActionPlan } from '../../planning/models/ActionPlan';
import { OutcomeAnalysis } from '../models/OutcomeAnalysis';
import { GoalEvaluator } from './GoalEvaluator';
import { SuccessAnalyzer } from './SuccessAnalyzer';
import { FailureAnalyzer } from './FailureAnalyzer';

export class OutcomeAnalyzer {
  private goalEvaluator = new GoalEvaluator();
  private successAnalyzer = new SuccessAnalyzer();
  private failureAnalyzer = new FailureAnalyzer();

  public analyzeOutcome(plan: ActionPlan, obs: ExecutionObservation): OutcomeAnalysis {
    const outcomeId = `outc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const goalEvaluation = this.goalEvaluator.evaluateGoal(plan, obs);

    const executionSuccess = obs.executionStatus === 'SUCCEEDED' || obs.executionStatus === 'COMPLETED';
    const verificationSuccess = obs.verificationResults.passed && obs.testResults.passed;
    const objectiveSuccess = goalEvaluation.goalStatus === 'ACHIEVED';

    const unexpectedChanges: string[] = [];
    const plannedTargets = new Set(plan.steps.map(s => s.target.id));
    for (const f of obs.changedFiles) {
      if (!plannedTargets.has(f) && !plan.affectedResources.includes(f)) {
        unexpectedChanges.push(f);
      }
    }

    const failureAnalysis = !objectiveSuccess
      ? this.failureAnalyzer.analyzeFailure(plan, obs)
      : undefined;

    const successAnalysis = objectiveSuccess
      ? this.successAnalyzer.analyzeSuccess(plan, obs)
      : undefined;

    const unresolvedIssues: string[] = [];
    if (!objectiveSuccess) {
      unresolvedIssues.push(...obs.errors);
      if (obs.testResults.failures) unresolvedIssues.push(...obs.testResults.failures);
    }

    return {
      outcomeId,
      executionId: obs.executionId,
      executionSuccess,
      objectiveSuccess,
      verificationSuccess,
      goalEvaluation,
      failureAnalysis,
      successAnalysis,
      unexpectedChanges,
      unresolvedIssues
    };
  }
}
