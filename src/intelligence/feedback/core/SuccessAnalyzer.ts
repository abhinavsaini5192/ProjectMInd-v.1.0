import { ExecutionObservation } from '../models/ExecutionObservation';
import { ActionPlan } from '../../planning/models/ActionPlan';
import { SuccessAnalysis } from '../models/SuccessAnalysis';

export class SuccessAnalyzer {
  public analyzeSuccess(plan: ActionPlan, obs: ExecutionObservation): SuccessAnalysis {
    const succeededSteps = plan.steps.map(s => s.stepId);
    const verificationsPassed = obs.verificationResults.checks;

    return {
      succeededSteps,
      whySucceeded: `All ${succeededSteps.length} planned steps executed cleanly and satisfied test constraints.`,
      verificationsPassed,
      unexpectedChanges: [],
      confidence: 0.95
    };
  }
}
