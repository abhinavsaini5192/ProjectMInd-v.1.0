import { describe, it, expect, beforeEach } from 'vitest';
import { SLMDecisionRouter, RoutingDecision } from '../../../src/intelligence/slm/routing/SLMDecisionRouter';
import { TrustEstimator } from '../../../src/intelligence/slm/routing/TrustEstimator';
import { ConfidenceCalibrator } from '../../../src/intelligence/slm/routing/ConfidenceCalibrator';
import { SLMTaskType } from '../../../src/intelligence/slm/models/SLMTaskType';

describe('SLM Routing & Calibration (L3.6)', () => {
  let router: SLMDecisionRouter;
  let trustEstimator: TrustEstimator;
  let calibrator: ConfidenceCalibrator;

  beforeEach(() => {
    trustEstimator = new TrustEstimator();
    router = new SLMDecisionRouter(trustEstimator, 0.7); // threshold = 0.7
    calibrator = new ConfidenceCalibrator();
  });

  it('should strictly route security critical tasks to deterministic reasoning', () => {
    // Even if trust is extremely high (1.0), security flag overrides
    trustEstimator.updateTrust(SLMTaskType.FEATURE_INTERPRETATION, 1.0, 0);
    
    const decision = router.routeTask(SLMTaskType.FEATURE_INTERPRETATION, true);
    expect(decision).toBe(RoutingDecision.DETERMINISTIC_ONLY);
  });

  it('should route to SLM_PRIMARY if trust score exceeds threshold', () => {
    // Set summarization trust above 0.7
    trustEstimator.updateTrust(SLMTaskType.REASONING_SUMMARY, 0.9, 0.0);
    
    const decision = router.routeTask(SLMTaskType.REASONING_SUMMARY, false);
    expect(decision).toBe(RoutingDecision.SLM_PRIMARY);
  });

  it('should route to HYBRID if trust score is marginal', () => {
    // 0.7 * 0.6 = 0.42. Set trust to 0.5.
    // In our implementation, default trust for SEMANTIC_SIMILARITY is 0.6.
    const decision = router.routeTask(SLMTaskType.SEMANTIC_SIMILARITY, false);
    expect(decision).toBe(RoutingDecision.HYBRID);
  });

  it('should severely penalize trust when hallucinations occur', () => {
    const initialTrust = trustEstimator.getTrustScore(SLMTaskType.FEATURE_INTERPRETATION);
    
    // 100% precision, but 50% hallucination rate
    trustEstimator.updateTrust(SLMTaskType.FEATURE_INTERPRETATION, 1.0, 0.5);
    
    const newTrust = trustEstimator.getTrustScore(SLMTaskType.FEATURE_INTERPRETATION);
    expect(newTrust).toBeLessThan(initialTrust); // Trust drops heavily
  });

  it('should calibrate confidence based on statistical reality', () => {
    // Model is 90% confident on average, but only correct 45% of the time.
    calibrator.updateCalibration(0.45, 0.90); 
    
    // A new prediction comes in with 0.80 confidence. It should be halved (0.45/0.90 = 0.5 factor).
    const calibrated = calibrator.calibrate(0.80);
    expect(calibrated).toBe(0.40);
  });
});
