import { LearningCandidate } from '../models/LearningCandidate';
import { OutcomeAnalysis } from '../models/OutcomeAnalysis';
import { ChangeSet } from '../models/ChangeSet';
import { Evidence } from '../models/Evidence';

export class LearningCandidateBuilder {
  public buildCandidates(
    taskId: string,
    outcome: OutcomeAnalysis,
    changes: ChangeSet
  ): LearningCandidate[] {
    const candidates: LearningCandidate[] = [];
    const timestamp = Date.now();

    // 1. Success Pattern
    if (outcome.objectiveSuccess) {
      const evidence: Evidence[] = [{
        evidenceId: `ev_succ_${timestamp}`,
        sourceType: 'EXECUTION',
        sourceId: outcome.executionId,
        description: `Verified objective success for task "${taskId}"`,
        timestamp,
        reliability: 0.95,
        confidence: 0.95
      }];

      candidates.push({
        candidateId: `lc_succ_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        category: 'SUCCESS_PATTERN',
        content: `Successful modification on resources: ${changes.records.map(r => r.resourceId).join(', ')} achieved objective for task "${taskId}".`,
        confidence: 'HIGH',
        confidenceScore: 0.9,
        evidence,
        source: 'OutcomeAnalyzer',
        scope: 'TASK',
        temporalType: 'PERSISTENT',
        promotionStatus: 'CANDIDATE',
        createdAt: timestamp
      });
    }

    // 2. Failure Pattern
    if (outcome.failureAnalysis && !outcome.objectiveSuccess) {
      const evidence: Evidence[] = [{
        evidenceId: `ev_fail_${timestamp}`,
        sourceType: 'EXECUTION',
        sourceId: outcome.executionId,
        description: `Failure identified: ${outcome.failureAnalysis.directCause}`,
        timestamp,
        reliability: 0.9,
        confidence: 0.9
      }];

      candidates.push({
        candidateId: `lc_fail_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        category: 'FAILURE_PATTERN',
        content: `Failure mode (${outcome.failureAnalysis.failureType}): ${outcome.failureAnalysis.directCause}. Recommendation: ${outcome.failureAnalysis.recommendation}.`,
        confidence: 'MEDIUM',
        confidenceScore: 0.75,
        evidence,
        source: 'FailureAnalyzer',
        scope: 'MODULE',
        temporalType: 'PERSISTENT',
        promotionStatus: 'OBSERVATION',
        createdAt: timestamp
      });
    }

    return candidates;
  }
}
