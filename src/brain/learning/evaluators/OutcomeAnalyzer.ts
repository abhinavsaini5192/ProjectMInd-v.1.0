import { AgentSession } from '../models/AgentSession';
import { Outcome } from '../models/Outcome';

export class OutcomeAnalyzer {
  public analyze(session: AgentSession): Outcome {
    if (session.status === 'ABANDONED') return Outcome.ABANDONED;
    if (session.status === 'FAILED') return Outcome.FAILED;

    if (session.testResults) {
       if (session.testResults.failed > 0) return Outcome.PARTIAL_SUCCESS;
       return Outcome.SUCCESS;
    }

    if (session.changedFiles.length > 0) return Outcome.SUCCESS;
    return Outcome.UNKNOWN;
  }
}
