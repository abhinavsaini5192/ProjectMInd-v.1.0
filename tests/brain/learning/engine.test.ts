import { describe, it, expect, beforeEach } from 'vitest';
import { LearningEngine } from '../../../src/brain/learning/core/LearningEngine';
import { AgentExecutionTracker } from '../../../src/brain/learning/core/AgentExecutionTracker';
import { SessionTracker } from '../../../src/brain/learning/core/SessionTracker';
import { OutcomeAnalyzer } from '../../../src/brain/learning/evaluators/OutcomeAnalyzer';
import { RegressionDetector } from '../../../src/brain/learning/evaluators/RegressionDetector';
import { ContextEvaluator } from '../../../src/brain/learning/evaluators/ContextEvaluator';
import { MissingContextDetector } from '../../../src/brain/learning/evaluators/MissingContextDetector';
import { DecisionQualityScorer } from '../../../src/brain/learning/evaluators/DecisionQualityScorer';
import { ContextUtilityScorer } from '../../../src/brain/learning/evaluators/ContextUtilityScorer';
import { PolicyAdjustmentEngine } from '../../../src/brain/learning/core/PolicyAdjustmentEngine';
import { FeedbackProcessor } from '../../../src/brain/learning/core/FeedbackProcessor';
import { DatasetEligibilityValidator } from '../../../src/brain/learning/dataset/DatasetEligibilityValidator';
import { PrivacyFilter } from '../../../src/brain/learning/dataset/PrivacyFilter';
import { TrainingExampleBuilder } from '../../../src/brain/learning/dataset/TrainingExampleBuilder';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { Outcome } from '../../../src/brain/learning/models/Outcome';

describe('Decision Learning & Feedback Engine (L3.4)', () => {
  let learningEngine: LearningEngine;
  let executionTracker: AgentExecutionTracker;
  let sessionTracker: SessionTracker;
  let datasetBuilder: TrainingExampleBuilder;

  beforeEach(() => {
    const dispatcher = new KernelEventDispatcher();
    sessionTracker = new SessionTracker();
    executionTracker = new AgentExecutionTracker(sessionTracker, dispatcher);
    
    learningEngine = new LearningEngine(
      sessionTracker,
      new OutcomeAnalyzer(),
      new RegressionDetector(),
      new ContextEvaluator(),
      new MissingContextDetector(),
      new DecisionQualityScorer(),
      new ContextUtilityScorer(),
      new PolicyAdjustmentEngine(),
      dispatcher
    );

    datasetBuilder = new TrainingExampleBuilder(
      new DatasetEligibilityValidator(),
      new PrivacyFilter()
    );
  });

  it('should evaluate a successful decision and build a training example', () => {
    const decisionId = 'dec_1';
    const providedContext = ['feat_auth', 'feat_db'];
    
    // Simulate Agent Session
    const session = executionTracker.startSession(decisionId, 'cursor', 'sess_1');
    executionTracker.completeSession(session, ['feat_auth'], { passed: 10, failed: 0 });

    const record = learningEngine.evaluateDecision(
      decisionId,
      'Fix auth bug',
      'repo_1',
      'snap_1',
      providedContext,
      [],
      []
    );

    expect(record.outcome).toBe(Outcome.SUCCESS);
    expect(record.decisionQualityScore).toBeGreaterThan(0.7); // High quality

    const example = datasetBuilder.build(record);
    expect(example).toBeDefined();
    expect(example?.output.recommendedContextIds).toContain('feat_auth');
  });

  it('should detect missing context and adjust policy', () => {
    const decisionId = 'dec_2';
    // Brain provided no context
    const providedContext: string[] = []; 
    
    const session = executionTracker.startSession(decisionId, 'cursor', 'sess_2');
    // Agent had to modify feat_auth which wasn't provided
    executionTracker.completeSession(session, ['feat_auth'], { passed: 10, failed: 0 });

    const record = learningEngine.evaluateDecision(decisionId, 'Fix auth bug', 'repo_1', 'snap_1', providedContext, [], []);

    expect(record.contextUtility.missing).toContain('file_feat_auth');
    expect(record.policyVersion).toContain('adjusted'); // Triggered missing context policy adjustment
    
    // Should still be eligible for training since outcome was SUCCESS, 
    // and the target context will now include feat_auth
    const example = datasetBuilder.build(record);
    expect(example?.output.recommendedContextIds).toContain('file_feat_auth');
  });

  it('should reject regressions from training data', () => {
    const decisionId = 'dec_3';
    
    const session = executionTracker.startSession(decisionId, 'cursor', 'sess_3');
    // Introduced a test failure
    executionTracker.completeSession(session, ['feat_auth'], { passed: 9, failed: 1 });

    const record = learningEngine.evaluateDecision(decisionId, 'Fix auth bug', 'repo_1', 'snap_1', ['feat_auth'], [], []);

    expect(record.regressions.length).toBeGreaterThan(0);

    const example = datasetBuilder.build(record);
    expect(example).toBeNull(); // Rejected
  });

  it('should securely sanitize secrets before training dataset generation', () => {
    const decisionId = 'dec_4';
    
    const session = executionTracker.startSession(decisionId, 'cursor', 'sess_4');
    executionTracker.completeSession(session, ['feat_auth'], { passed: 10, failed: 0 });

    const record = learningEngine.evaluateDecision(
      decisionId, 
      'Fix auth bug password="supersecretpassword"', 
      'repo_1', 
      'snap_1', 
      ['feat_auth'], 
      [], 
      []
    );

    const example = datasetBuilder.build(record)!;
    expect(example.input.task).toContain('[REDACTED]');
    expect(example.input.task).not.toContain('supersecretpassword');
  });
});
