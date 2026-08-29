import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionFusionEngine } from '../../../src/intelligence/fusion/core/DecisionFusionEngine';
import { SLMDecisionRouter, RoutingDecision } from '../../../src/intelligence/slm/routing/SLMDecisionRouter';
import { TrustEstimator } from '../../../src/intelligence/slm/routing/TrustEstimator';
import { ConfidenceCalibrator } from '../../../src/intelligence/slm/routing/ConfidenceCalibrator';
import { TaskWeightingPolicy } from '../../../src/intelligence/fusion/core/TaskWeightingPolicy';
import { ContradictionDetector } from '../../../src/intelligence/fusion/core/ContradictionDetector';
import { ContextBudgetManager } from '../../../src/intelligence/fusion/budget/ContextBudgetManager';
import { ContextPackageBuilder } from '../../../src/intelligence/fusion/budget/ContextPackageBuilder';
import { SLMTaskType } from '../../../src/intelligence/slm/models/SLMTaskType';

describe('Brain-SLM Fusion Engine (L3.7)', () => {
  let fusionEngine: DecisionFusionEngine;
  let packageBuilder: ContextPackageBuilder;

  beforeEach(() => {
    const trustEstimator = new TrustEstimator();
    trustEstimator.updateTrust(SLMTaskType.FEATURE_INTERPRETATION, 1.0, 0); // High trust for testing
    
    const router = new SLMDecisionRouter(trustEstimator, 0.7);
    const policy = new TaskWeightingPolicy();
    const calibrator = new ConfidenceCalibrator();
    const contradictionDetector = new ContradictionDetector();

    fusionEngine = new DecisionFusionEngine(router, policy, calibrator, contradictionDetector);
    packageBuilder = new ContextPackageBuilder(new ContextBudgetManager());
  });

  it('should accurately blend deterministic and SLM scores according to policy', () => {
    const detScores = { 'AuthService': 0.9, 'UnknownFile': 0.1 };
    const slmScores = { 'AuthService': 1.0, 'UnknownFile': 0.0 };

    // FEATURE_INTERPRETATION weights: Det 0.4, SLM 0.6
    const decision = fusionEngine.fuse(
      'task_1', SLMTaskType.FEATURE_INTERPRETATION, false, detScores, slmScores, 1.0
    );

    const authFused = decision.fusedEntities.find(e => e.entityId === 'AuthService');
    // (0.9 * 0.4) + (1.0 * 0.6 * 1.0) = 0.36 + 0.60 = 0.96
    expect(authFused?.finalScore).toBeCloseTo(0.96, 2);
    expect(decision.routingStrategy).toBe(RoutingDecision.HYBRID);
  });

  it('should detect contradictions when scores diverge wildly', () => {
    const detScores = { 'OldService': 0.9 }; // Brain says yes
    const slmScores = { 'OldService': 0.1 }; // SLM says no

    const decision = fusionEngine.fuse(
      'task_2', SLMTaskType.FEATURE_INTERPRETATION, false, detScores, slmScores, 1.0
    );

    expect(decision.contradictions.length).toBe(1);
    expect(decision.contradictions[0].entityId).toBe('OldService');
  });

  it('should completely ignore SLM if task is security critical', () => {
    const detScores = { 'SecurityFilter': 0.9 }; 
    const slmScores = { 'SecurityFilter': 0.1 }; 

    const decision = fusionEngine.fuse(
      'task_3', SLMTaskType.FEATURE_INTERPRETATION, true, detScores, slmScores, 1.0
    );

    // Security Critical overrides routing to DETERMINISTIC_ONLY. Weights become Det=1.0, SLM=0.0
    const filterFused = decision.fusedEntities.find(e => e.entityId === 'SecurityFilter');
    // (0.9 * 1.0) + (0.0 * 0.0) = 0.9
    expect(filterFused?.finalScore).toBeCloseTo(0.9, 2);
    expect(decision.routingStrategy).toBe(RoutingDecision.DETERMINISTIC_ONLY);
  });

  it('should enforce context budget limits', () => {
    const detScores = { 'F1': 1.0, 'F2': 0.9, 'F3': 0.8, 'F4': 0.7 };
    const slmScores = { 'F1': 1.0, 'F2': 0.9, 'F3': 0.8, 'F4': 0.7 };

    const decision = fusionEngine.fuse(
      'task_4', SLMTaskType.FEATURE_INTERPRETATION, false, detScores, slmScores, 1.0
    );

    const budget = { maxEntities: 2, maxFiles: 2, maxTokens: 1000 };
    const ctxPackage = packageBuilder.buildPackage(decision, 'Test task', budget);

    expect(ctxPackage.primaryContext.length).toBe(2);
    expect(ctxPackage.primaryContext).toContain('F1');
    expect(ctxPackage.primaryContext).toContain('F2');
    expect(ctxPackage.primaryContext).not.toContain('F3'); // Trimmed
  });
});
