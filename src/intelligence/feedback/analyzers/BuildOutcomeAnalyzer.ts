import { ExecutionObservation } from '../models/ExecutionObservation';

export interface BuildAnalysisReport {
  success: boolean;
  errors: string[];
}

export class BuildOutcomeAnalyzer {
  public analyze(obs: ExecutionObservation): BuildAnalysisReport {
    const success = obs.buildResults?.success ?? true;
    const errors = obs.buildResults?.errors || [];

    return {
      success: success && errors.length === 0,
      errors
    };
  }
}
