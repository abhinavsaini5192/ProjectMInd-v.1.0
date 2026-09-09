import { describe, it, expect } from 'vitest';
import { FeatureHealthScorer } from '../../../../src/knowledge/features/health/core/FeatureHealthScorer.js';
import { HealthSignalHelper } from '../../../../src/knowledge/features/health/signals/HealthSignalHelper.js';
import { RiskDetectorHelper } from '../../../../src/knowledge/features/health/risks/RiskDetectorHelper.js';
import { FEATURE_HEALTH_DIMENSIONS } from '../../../../src/knowledge/features/health/models/FeatureHealthDimension.js';

describe('Phase 6.6 Scoring & Dimensional Breakdown', () => {
  const scorer = new FeatureHealthScorer();

  it('computes 10 dimension scores and starts at 100 with no negative signals', () => {
    const dimScores = scorer.scoreDimensions([]);

    for (const dim of FEATURE_HEALTH_DIMENSIONS) {
      expect(dimScores[dim]).toBeDefined();
      expect(dimScores[dim].score).toBe(100);
      expect(dimScores[dim].signalCount).toBe(0);
    }

    const overall = scorer.calculateOverallHealth(dimScores);
    expect(overall.overallScore).toBe(100);
    expect(overall.status).toBe('HEALTHY');
  });

  it('penalizes dimensions based on signal severity and normalized values', () => {
    const sig1 = HealthSignalHelper.createSignal({
      featureId: 'feat_test',
      signalType: 'HIGH_CYCLOMATIC_COMPLEXITY',
      severity: 'HIGH',
      value: 30,
      normalizedValue: 100, // full penalty for HIGH: -30
      description: 'High cyclomatic complexity',
      evidence: [],
      source: 'test',
      confidence: 0.9
    });

    const dimScores = scorer.scoreDimensions([sig1]);
    expect(dimScores.COMPLEXITY_HEALTH.score).toBe(70);
    expect(dimScores.COMPLEXITY_HEALTH.signalCount).toBe(1);

    // Other dimensions remain at 100
    expect(dimScores.SECURITY_HEALTH.score).toBe(100);
  });

  it('downgrades health status from HEALTHY/STABLE if critical security signal is present', () => {
    const critSecSig = HealthSignalHelper.createSignal({
      featureId: 'feat_sec',
      signalType: 'EXPOSED_SECRET',
      severity: 'CRITICAL',
      value: 'secret_leak',
      normalizedValue: 100, // penalty: -50 -> dim score 50 (and another critical would make it 0)
      description: 'Hardcoded secret',
      evidence: [],
      source: 'test',
      confidence: 1.0
    });
    const critSecSig2 = HealthSignalHelper.createSignal({
      featureId: 'feat_sec',
      signalType: 'MISSING_AUTHENTICATION',
      severity: 'CRITICAL',
      value: 'unauth_api',
      normalizedValue: 100, // second penalty: -50 -> dim score 0
      description: 'Missing auth',
      evidence: [],
      source: 'test',
      confidence: 1.0
    });

    const dimScores = scorer.scoreDimensions([critSecSig, critSecSig2]);
    expect(dimScores.SECURITY_HEALTH.score).toBe(0);

    const overall = scorer.calculateOverallHealth(dimScores);
    // Overall score might still be >= 70 from other dimensions, but status must be degraded
    expect(overall.status).not.toBe('HEALTHY');
    expect(overall.status).not.toBe('STABLE');
  });

  it('computes overall risk score using blended max (60%) and average (40%) formula', () => {
    const r1 = RiskDetectorHelper.createRisk({
      featureId: 'feat_r',
      riskType: 'SECURITY',
      severity: 'CRITICAL',
      score: 100,
      confidence: 1.0,
      description: 'Critical vulnerability',
      evidence: [],
      contributingSignals: []
    });

    const r2 = RiskDetectorHelper.createRisk({
      featureId: 'feat_r',
      riskType: 'COMPLEXITY',
      severity: 'LOW',
      score: 20,
      confidence: 0.8,
      description: 'Slight complexity',
      evidence: [],
      contributingSignals: []
    });

    const assessment = scorer.assessRisks([r1, r2]);
    // Max = 100, Avg = 60 -> 100 * 0.6 + 60 * 0.4 = 60 + 24 = 84
    expect(assessment.overallRiskScore).toBe(84);
    expect(assessment.highestRiskSeverity).toBe('CRITICAL');
    expect(assessment.riskCount).toBe(2);
  });
});
