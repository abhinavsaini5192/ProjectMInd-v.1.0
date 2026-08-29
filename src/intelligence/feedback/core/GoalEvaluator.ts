import { ActionPlan } from '../../planning/models/ActionPlan';
import { ExecutionObservation } from '../models/ExecutionObservation';
import { GoalEvaluation } from '../models/GoalEvaluation';

export class GoalEvaluator {
  public evaluateGoal(plan: ActionPlan, obs: ExecutionObservation): GoalEvaluation {
    const executionPassed = obs.executionStatus === 'SUCCEEDED' || obs.executionStatus === 'COMPLETED';
    const verifPassed = obs.verificationResults.passed && obs.testResults.passed;

    if (executionPassed && verifPassed) {
      return {
        goalStatus: 'ACHIEVED',
        explanation: `Goal "${plan.objective}" successfully achieved and verified with 0 failures.`,
        evidenceIds: [obs.observationId],
        confidence: 0.95
      };
    }

    if (executionPassed && !verifPassed) {
      return {
        goalStatus: 'PARTIALLY_ACHIEVED',
        explanation: `Execution completed, but verification/tests did not fully pass: ${obs.testResults.failures.join(', ')}`,
        evidenceIds: [obs.observationId],
        confidence: 0.6
      };
    }

    return {
      goalStatus: 'NOT_ACHIEVED',
      explanation: `Execution failed with errors: ${obs.errors.join('; ')}`,
      evidenceIds: [obs.observationId],
      confidence: 0.85
    };
  }
}
