import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureRiskDetector } from '../../../../src/knowledge/features/health/core/FeatureRiskDetector.js';
import { RiskDetectorHelper } from '../../../../src/knowledge/features/health/risks/RiskDetectorHelper.js';
import { CircularDependencyRiskDetector } from '../../../../src/knowledge/features/health/risks/CircularDependencyRiskDetector.js';
import { SecurityRiskDetector } from '../../../../src/knowledge/features/health/risks/SecurityRiskDetector.js';
import { VerificationRiskDetector } from '../../../../src/knowledge/features/health/risks/VerificationRiskDetector.js';
import { HealthSignalHelper } from '../../../../src/knowledge/features/health/signals/HealthSignalHelper.js';

describe('Phase 6.6 Risk Detectors & Deduplication', () => {
  it('deduplicates multiple risks of the same type for a feature and retains highest severity', () => {
    const risk1 = RiskDetectorHelper.createRisk({
      featureId: 'feat_dedup',
      riskType: 'COMPLEXITY',
      severity: 'MEDIUM',
      score: 50,
      confidence: 0.8,
      description: 'First complexity warning',
      evidence: [],
      contributingSignals: ['sig_1']
    });

    const risk2 = RiskDetectorHelper.createRisk({
      featureId: 'feat_dedup',
      riskType: 'COMPLEXITY',
      severity: 'HIGH',
      score: 85,
      confidence: 0.95,
      description: 'Second extreme complexity warning',
      evidence: [],
      contributingSignals: ['sig_2']
    });

    const deduplicated = RiskDetectorHelper.deduplicateRisks([risk1, risk2]);
    expect(deduplicated.length).toBe(1);
    expect(deduplicated[0].severity).toBe('HIGH');
    expect(deduplicated[0].score).toBe(85);
    expect(deduplicated[0].contributingSignals).toEqual(['sig_1', 'sig_2']);
    expect(deduplicated[0].description).toContain('First complexity warning');
    expect(deduplicated[0].description).toContain('Second extreme complexity warning');
  });

  it('CircularDependencyRiskDetector detects critical cycle risk', async () => {
    const feature = HealthTestHelper.createFeature('feat_cycle', 'Feature with loop');
    const ctx = HealthTestHelper.createContext({ feature });
    const signal = HealthSignalHelper.createSignal({
      featureId: 'feat_cycle',
      signalType: 'CIRCULAR_FEATURE_DEPENDENCY',
      severity: 'CRITICAL',
      value: 'feat_cycle -> feat_b -> feat_cycle',
      normalizedValue: 100,
      description: 'Cycle path detected',
      evidence: [],
      source: 'test',
      confidence: 0.98
    });

    const detector = new CircularDependencyRiskDetector();
    const risks = await detector.detect(ctx, [signal]);

    expect(risks.length).toBe(1);
    expect(risks[0].riskType).toBe('CIRCULAR_DEPENDENCY');
    expect(risks[0].severity).toBe('CRITICAL');
    expect(risks[0].score).toBeGreaterThanOrEqual(90);
  });

  it('SecurityRiskDetector flags CRITICAL risk on exposed secret or prompt injection', async () => {
    const feature = HealthTestHelper.createFeature('feat_sec', 'Sensitive API');
    const ctx = HealthTestHelper.createContext({ feature });

    const secSignal = HealthSignalHelper.createSignal({
      featureId: 'feat_sec',
      signalType: 'EXPOSED_SECRET',
      severity: 'CRITICAL',
      value: 'test_secret_token',
      normalizedValue: 100,
      description: 'Exposed secret detected',
      evidence: [],
      source: 'test',
      confidence: 0.95
    });

    const detector = new SecurityRiskDetector();
    const risks = await detector.detect(ctx, [secSignal]);

    expect(risks.length).toBe(1);
    expect(risks[0].riskType).toBe('SECURITY');
    expect(risks[0].severity).toBe('CRITICAL');
    expect(risks[0].score).toBeGreaterThanOrEqual(90);
  });

  it('VerificationRiskDetector elevates to CRITICAL when critical flow is untested', async () => {
    const feature = HealthTestHelper.createFeature('feat_verif', 'Critical Flow Feature');
    const ctx = HealthTestHelper.createContext({ feature });

    const signal = HealthSignalHelper.createSignal({
      featureId: 'feat_verif',
      signalType: 'UNTESTED_CRITICAL_FLOW',
      severity: 'CRITICAL',
      value: 'Payment Flow',
      normalizedValue: 90,
      description: 'Untested critical flow',
      evidence: [],
      source: 'test',
      confidence: 0.95
    });

    const detector = new VerificationRiskDetector();
    const risks = await detector.detect(ctx, [signal]);

    expect(risks.length).toBe(1);
    expect(risks[0].severity).toBe('CRITICAL');
  });

  it('FeatureRiskDetector orchestrates all detectors cleanly', async () => {
    const feature = HealthTestHelper.createFeature('feat_all', 'Multi Risk Feature');
    const ctx = HealthTestHelper.createContext({ feature });

    const sig1 = HealthSignalHelper.createSignal({
      featureId: 'feat_all',
      signalType: 'HIGH_EFFERENT_COUPLING',
      severity: 'HIGH',
      value: 15,
      normalizedValue: 80,
      description: 'High efferent coupling',
      evidence: [],
      source: 'test',
      confidence: 0.9
    });

    const sig2 = HealthSignalHelper.createSignal({
      featureId: 'feat_all',
      signalType: 'HIGH_CYCLOMATIC_COMPLEXITY',
      severity: 'MEDIUM',
      value: 25,
      normalizedValue: 60,
      description: 'High complexity',
      evidence: [],
      source: 'test',
      confidence: 0.9
    });

    const detectorService = new FeatureRiskDetector();
    const risks = await detectorService.detectAll(ctx, [sig1, sig2]);

    expect(risks.length).toBe(2);
    expect(risks.some((r) => r.riskType === 'COUPLING')).toBe(true);
    expect(risks.some((r) => r.riskType === 'COMPLEXITY')).toBe(true);
  });
});
