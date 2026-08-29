import { AgentSession } from '../models/AgentSession';
import { Feedback } from '../models/Feedback';
import { LearningRecord } from '../models/LearningRecord';
import { SessionTracker } from './SessionTracker';
import { OutcomeAnalyzer } from '../evaluators/OutcomeAnalyzer';
import { RegressionDetector } from '../evaluators/RegressionDetector';
import { ContextEvaluator } from '../evaluators/ContextEvaluator';
import { MissingContextDetector } from '../evaluators/MissingContextDetector';
import { DecisionQualityScorer } from '../evaluators/DecisionQualityScorer';
import { ContextUtilityScorer } from '../evaluators/ContextUtilityScorer';
import { PolicyAdjustmentEngine } from './PolicyAdjustmentEngine';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import crypto from 'crypto';

import {
  LEARNING_RECORD_CREATED,
  POLICY_UPDATED
} from '../types/LearningEvents';

export class LearningEngine {
  constructor(
    private sessionTracker: SessionTracker,
    private outcomeAnalyzer: OutcomeAnalyzer,
    private regressionDetector: RegressionDetector,
    private contextEvaluator: ContextEvaluator,
    private missingDetector: MissingContextDetector,
    private qualityScorer: DecisionQualityScorer,
    private utilityScorer: ContextUtilityScorer,
    private policyEngine: PolicyAdjustmentEngine,
    private dispatcher: KernelEventDispatcher
  ) {}

  public evaluateDecision(
    decisionId: string, 
    task: string,
    repositoryId: string,
    snapshotId: string,
    providedContextIds: string[], 
    excludedContextIds: string[],
    preExistingFailures: string[],
    feedback?: Feedback
  ): LearningRecord {
    
    const sessions = this.sessionTracker.getSessionsForDecision(decisionId);
    
    // Use the latest session for final outcome
    const latestSession = sessions[sessions.length - 1];
    if (!latestSession) throw new Error('No sessions found for decision');

    const outcome = this.outcomeAnalyzer.analyze(latestSession);
    const regressions = this.regressionDetector.detect(latestSession, preExistingFailures);
    
    const { useful, unused, misleading } = this.contextEvaluator.evaluate(providedContextIds, latestSession, feedback);
    const missing = this.missingDetector.detect(providedContextIds, latestSession, feedback);

    const utilityScore = this.utilityScorer.score(useful, unused, missing, misleading);
    
    // Sum iterations across all sessions
    const totalIterations = sessions.reduce((sum, s) => sum + s.iterations, 0);
    const qualityScore = this.qualityScorer.score(outcome, utilityScore, regressions, totalIterations);

    const record: LearningRecord = {
       recordId: crypto.randomUUID(),
       repositoryId,
       decisionId,
       task,
       snapshotId,
       contextProvided: providedContextIds,
       contextExcluded: excludedContextIds,
       sessions,
       outcome,
       contextUtility: { useful, unused, missing, misleading },
       regressions,
       feedback,
       decisionQualityScore: qualityScore,
       contextUtilityScore: utilityScore,
       policyVersion: 'v1.0',
       timestamp: Date.now()
    };

    const newPolicy = this.policyEngine.adjustPolicy(record);
    if (newPolicy !== record.policyVersion) {
       record.policyVersion = newPolicy;
       this.dispatcher.publish(POLICY_UPDATED, { newVersion: newPolicy });
    }

    this.dispatcher.publish(LEARNING_RECORD_CREATED, { recordId: record.recordId });

    return record;
  }
}
