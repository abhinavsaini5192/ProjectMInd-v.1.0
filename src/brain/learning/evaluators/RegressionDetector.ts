import { AgentSession } from '../models/AgentSession';

export class RegressionDetector {
  public detect(session: AgentSession, preExistingFailures: string[]): string[] {
    const regressions: string[] = [];
    
    // Mock logic: assume session has a detailed list of test failures
    // For now we simulate regression detection.
    if (session.testResults && session.testResults.failed > 0) {
       // Mock: if failed > preExisting, assume regression
       if (session.testResults.failed > preExistingFailures.length) {
          regressions.push('Simulated regression in test suite');
       }
    }

    return regressions;
  }
}
