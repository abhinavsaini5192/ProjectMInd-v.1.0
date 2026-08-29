import { describe, it, expect, beforeEach } from 'vitest';
import { RecoveryEngine } from '../../../src/agent/recovery/core/RecoveryEngine';
import { FailureClassifier } from '../../../src/agent/recovery/classification/FailureClassifier';
import { PreExistingFailureDetector } from '../../../src/agent/recovery/core/PreExistingFailureDetector';
import { RecoveryDecisionEngine } from '../../../src/agent/recovery/core/RecoveryDecisionEngine';
import { VerificationResult, OverallStatus } from '../../../src/agent/verification/models/VerificationResult';
import { FailureCategory } from '../../../src/agent/recovery/classification/FailureCategory';
import { FailureSeverity } from '../../../src/agent/recovery/classification/FailureSeverity';
import { RecoveryStrategyType } from '../../../src/agent/recovery/models/RecoveryPlan';
import { RecoveryStatus } from '../../../src/agent/recovery/models/RecoveryResult';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { CheckStatus } from '../../../src/agent/verification/models/CheckResult';

describe('Recovery, Rollback & Failure Resolution Engine (Phase 4.8)', () => {
  let engine: RecoveryEngine;

  beforeEach(() => {
    engine = new RecoveryEngine(new KernelEventDispatcher());
  });

  const createMockVerification = (status: OverallStatus, failures: string[], checks: any[] = []): VerificationResult => ({
    verificationId: 'v1', taskId: 't1', planId: 'p1', executionId: 'e1',
    overallStatus: status, confidence: 'HIGH', checks, failures, warnings: [], unexpectedChanges: [], missingChanges: [], recommendations: []
  });

  it('FailureClassifier should classify SYNTAX errors as CRITICAL', () => {
    const classifier = new FailureClassifier();
    const result = createMockVerification(OverallStatus.FAILED, [], [
       { type: 'SYNTAX', status: CheckStatus.FAIL }
    ]);
    const { category, severity } = classifier.classify(result);
    expect(category).toBe(FailureCategory.SYNTAX_FAILURE);
    expect(severity).toBe(FailureSeverity.CRITICAL);
  });

  it('FailureClassifier should classify TEST errors as WARNING', () => {
    const classifier = new FailureClassifier();
    const result = createMockVerification(OverallStatus.FAILED, [], [
       { type: 'TEST', status: CheckStatus.FAIL }
    ]);
    const { category, severity } = classifier.classify(result);
    expect(category).toBe(FailureCategory.TEST_FAILURE);
    expect(severity).toBe(FailureSeverity.WARNING);
  });

  it('PreExistingFailureDetector should correctly identify pre-existing failures', () => {
    const detector = new PreExistingFailureDetector();
    const before = createMockVerification(OverallStatus.FAILED, ['Test A failed']);
    const after = createMockVerification(OverallStatus.FAILED, ['Test A failed']); // Same failure
    
    const { isNew, newFailures } = detector.detect(before, after);
    expect(isNew).toBe(false);
    expect(newFailures.length).toBe(0);
  });

  it('PreExistingFailureDetector should identify new regressions', () => {
    const detector = new PreExistingFailureDetector();
    const before = createMockVerification(OverallStatus.FAILED, ['Test A failed']);
    const after = createMockVerification(OverallStatus.FAILED, ['Test A failed', 'Test B failed']); // Added a failure
    
    const { isNew, newFailures } = detector.detect(before, after);
    expect(isNew).toBe(true);
    expect(newFailures).toContain('Test B failed');
  });

  it('RecoveryDecisionEngine should choose NO_ACTION for pre-existing failures', () => {
    const decider = new RecoveryDecisionEngine();
    const plan = decider.selectStrategy(FailureCategory.TEST_FAILURE, FailureSeverity.WARNING, 0, 3, true);
    expect(plan.strategy).toBe(RecoveryStrategyType.NO_ACTION);
  });

  it('RecoveryDecisionEngine should immediately choose ROLLBACK for CRITICAL failures', () => {
    const decider = new RecoveryDecisionEngine();
    const plan = decider.selectStrategy(FailureCategory.SYNTAX_FAILURE, FailureSeverity.CRITICAL, 0, 3, false);
    expect(plan.strategy).toBe(RecoveryStrategyType.ROLLBACK);
  });

  it('RecoveryEngine should halt and ROLLBACK after MAX_ATTEMPTS', async () => {
    const before = createMockVerification(OverallStatus.VERIFIED, []);
    const after = createMockVerification(OverallStatus.FAILED, ['Build failed'], [
       { type: 'BUILD', status: CheckStatus.FAIL }
    ]);

    // Will hit REPAIR 3 times, fail each simulation, then the decision engine returns ROLLBACK
    const result = await engine.orchestrateRecovery(before, after);
    
    expect(result.status).toBe(RecoveryStatus.ROLLED_BACK);
    expect(result.attempts.length).toBeGreaterThan(0); // Multiple attempts were made
    
    const lastAttempt = result.attempts[result.attempts.length - 1];
    expect(lastAttempt.strategy).toBe(RecoveryStrategyType.ROLLBACK);
  });

  it('RecoveryEngine should safely ABORT (No Action) for pre-existing failures', async () => {
    const before = createMockVerification(OverallStatus.FAILED, ['Existing error'], [
       { type: 'TEST', status: CheckStatus.FAIL }
    ]);
    const after = createMockVerification(OverallStatus.FAILED, ['Existing error'], [
       { type: 'TEST', status: CheckStatus.FAIL }
    ]);

    const result = await engine.orchestrateRecovery(before, after);
    
    expect(result.status).toBe(RecoveryStatus.ABORTED);
    expect(result.attempts[0].strategy).toBe(RecoveryStrategyType.NO_ACTION);
  });
});
