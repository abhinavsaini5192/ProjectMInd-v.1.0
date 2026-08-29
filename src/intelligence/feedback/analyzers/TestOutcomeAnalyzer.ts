import { ExecutionObservation } from '../models/ExecutionObservation';

export interface TestAnalysisReport {
  allPassed: boolean;
  failedCount: number;
  failureSummaries: string[];
}

export class TestOutcomeAnalyzer {
  public analyze(obs: ExecutionObservation): TestAnalysisReport {
    const passed = obs.testResults?.passed ?? true;
    const failedCount = obs.testResults?.testsFailed || (obs.testResults?.failures?.length || 0);
    const failureSummaries = obs.testResults?.failures || [];

    return {
      allPassed: passed && failedCount === 0,
      failedCount,
      failureSummaries
    };
  }
}
