import { describe, it, expect } from 'vitest';
import {
  isFeatureHealthStatus,
  FEATURE_HEALTH_STATUSES,
  isHealthSignalSeverity,
  HEALTH_SIGNAL_SEVERITIES,
  isHealthSignalType,
  HEALTH_SIGNAL_TYPES,
  isFeatureRiskSeverity,
  FEATURE_RISK_SEVERITIES,
  isFeatureRiskType,
  FEATURE_RISK_TYPES,
  isFeatureHealthDimension,
  FEATURE_HEALTH_DIMENSIONS,
  isFeatureCriticalityLevel,
  FEATURE_CRITICALITY_LEVELS,
  isFeatureStabilityLevel,
  FEATURE_STABILITY_LEVELS,
  isVerificationLevel,
  VERIFICATION_LEVELS,
  FeatureHealthError,
  HealthAnalysisError,
  RiskAssessmentError,
  HealthValidationError,
  InvalidHealthReferenceError
} from '../../../../src/knowledge/features/health/index.js';

describe('Phase 6.6 Models, Enums & Error Classes', () => {
  it('validates feature health status enum and type guard', () => {
    expect(FEATURE_HEALTH_STATUSES).toContain('HEALTHY');
    expect(FEATURE_HEALTH_STATUSES).toContain('CRITICAL');
    expect(FEATURE_HEALTH_STATUSES.length).toBe(7);
    expect(isFeatureHealthStatus('HEALTHY')).toBe(true);
    expect(isFeatureHealthStatus('INVALID_STATUS')).toBe(false);
  });

  it('validates health signal severity and type', () => {
    expect(HEALTH_SIGNAL_SEVERITIES.length).toBe(5);
    expect(isHealthSignalSeverity('CRITICAL')).toBe(true);
    expect(isHealthSignalSeverity('INFO')).toBe(true);
    expect(isHealthSignalSeverity('UNKNOWN')).toBe(false);

    expect(HEALTH_SIGNAL_TYPES).toContain('HIGH_CYCLOMATIC_COMPLEXITY');
    expect(HEALTH_SIGNAL_TYPES).toContain('CIRCULAR_FEATURE_DEPENDENCY');
    expect(HEALTH_SIGNAL_TYPES).toContain('EXPOSED_SECRET');
    expect(isHealthSignalType('EXPOSED_SECRET')).toBe(true);
    expect(isHealthSignalType('FOOBAR')).toBe(false);
  });

  it('validates risk types and severities', () => {
    expect(FEATURE_RISK_TYPES.length).toBe(12);
    expect(isFeatureRiskType('CIRCULAR_DEPENDENCY')).toBe(true);
    expect(isFeatureRiskType('SECURITY')).toBe(true);
    expect(isFeatureRiskType('RANDOM')).toBe(false);

    expect(FEATURE_RISK_SEVERITIES.length).toBe(5);
    expect(isFeatureRiskSeverity('CRITICAL')).toBe(true);
  });

  it('validates 10 health dimensions', () => {
    expect(FEATURE_HEALTH_DIMENSIONS.length).toBe(10);
    expect(isFeatureHealthDimension('STRUCTURAL_HEALTH')).toBe(true);
    expect(isFeatureHealthDimension('SECURITY_HEALTH')).toBe(true);
    expect(isFeatureHealthDimension('VERIFICATION_HEALTH')).toBe(true);
    expect(isFeatureHealthDimension('NOT_A_DIM')).toBe(false);
  });

  it('validates criticality, stability, and verification levels', () => {
    expect(FEATURE_CRITICALITY_LEVELS.length).toBe(4);
    expect(isFeatureCriticalityLevel('CRITICAL')).toBe(true);
    expect(isFeatureCriticalityLevel('LOW')).toBe(true);

    expect(FEATURE_STABILITY_LEVELS.length).toBe(5);
    expect(isFeatureStabilityLevel('STABLE')).toBe(true);
    expect(isFeatureStabilityLevel('HIGHLY_UNSTABLE')).toBe(true);

    expect(VERIFICATION_LEVELS.length).toBe(5);
    expect(isVerificationLevel('COMPREHENSIVE')).toBe(true);
    expect(isVerificationLevel('NONE')).toBe(true);
  });

  it('validates error inheritance and proper prototypes', () => {
    const base = new FeatureHealthError('base error', 'ERR_CODE', { foo: 'bar' });
    expect(base instanceof Error).toBe(true);
    expect(base.code).toBe('ERR_CODE');
    expect(base.details?.foo).toBe('bar');

    const analysisErr = new HealthAnalysisError('analysis failed', 'feat_123');
    expect(analysisErr instanceof FeatureHealthError).toBe(true);
    expect(analysisErr.featureId).toBe('feat_123');

    const riskErr = new RiskAssessmentError('risk failed', 'feat_456');
    expect(riskErr instanceof FeatureHealthError).toBe(true);
    expect(riskErr.featureId).toBe('feat_456');

    const valErr = new HealthValidationError('val error', ['field required']);
    expect(valErr instanceof FeatureHealthError).toBe(true);
    expect(valErr.validationErrors).toEqual(['field required']);

    const refErr = new InvalidHealthReferenceError('Feature', 'non_existent_id');
    expect(refErr instanceof FeatureHealthError).toBe(true);
    expect(refErr.referenceType).toBe('Feature');
    expect(refErr.referenceId).toBe('non_existent_id');
  });
});
