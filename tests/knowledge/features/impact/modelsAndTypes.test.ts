import { describe, it, expect } from 'vitest';
import {
  ALL_CHANGE_TYPES,
  isValidChangeType,
} from '../../../../src/knowledge/features/impact/models/ChangeType.js';
import {
  ALL_IMPACT_TYPES,
  isValidImpactType,
} from '../../../../src/knowledge/features/impact/models/ImpactType.js';
import {
  ALL_IMPACT_SCOPES,
  isValidImpactScope,
} from '../../../../src/knowledge/features/impact/models/ImpactScope.js';
import {
  ALL_IMPACT_DIRECTIONS,
  isValidImpactDirection,
} from '../../../../src/knowledge/features/impact/models/ImpactDirection.js';
import {
  ALL_IMPACT_SEVERITIES,
  isValidImpactSeverity,
} from '../../../../src/knowledge/features/impact/models/ImpactSeverity.js';
import {
  confidenceToNumeric,
  numericToConfidence,
} from '../../../../src/knowledge/features/impact/models/ImpactConfidence.js';
import { FeatureImpactError } from '../../../../src/knowledge/features/impact/errors/FeatureImpactError.js';
import { InvalidImpactReferenceError } from '../../../../src/knowledge/features/impact/errors/InvalidImpactReferenceError.js';

describe('Phase 6.7 - Models & Types', () => {
  it('should validate canonical change types', () => {
    expect(ALL_CHANGE_TYPES).toContain('CREATED');
    expect(ALL_CHANGE_TYPES).toContain('MODIFIED');
    expect(ALL_CHANGE_TYPES).toContain('DELETED');
    expect(ALL_CHANGE_TYPES).toContain('SIGNATURE_CHANGED');
    expect(ALL_CHANGE_TYPES).toContain('API_CHANGED');
    expect(ALL_CHANGE_TYPES).toContain('DATA_SCHEMA_CHANGED');

    expect(isValidChangeType('API_CHANGED')).toBe(true);
    expect(isValidChangeType('NOT_A_CHANGE')).toBe(false);
  });

  it('should validate canonical impact types', () => {
    expect(ALL_IMPACT_TYPES).toContain('DIRECT');
    expect(ALL_IMPACT_TYPES).toContain('INDIRECT');
    expect(ALL_IMPACT_TYPES).toContain('BEHAVIORAL');
    expect(ALL_IMPACT_TYPES).toContain('DEPENDENCY');
    expect(ALL_IMPACT_TYPES).toContain('API');
    expect(ALL_IMPACT_TYPES).toContain('DATA');
    expect(ALL_IMPACT_TYPES).toContain('VERIFICATION');

    expect(isValidImpactType('DIRECT')).toBe(true);
    expect(isValidImpactType('UNKNOWN_IMPACT')).toBe(false);
  });

  it('should validate impact scopes, directions, and severities', () => {
    expect(ALL_IMPACT_SCOPES).toEqual(
      expect.arrayContaining(['RESOURCE', 'SYMBOL', 'FILE', 'MODULE', 'FEATURE', 'SUBSYSTEM', 'REPOSITORY'])
    );
    expect(isValidImpactScope('FEATURE')).toBe(true);

    expect(ALL_IMPACT_DIRECTIONS).toEqual(
      expect.arrayContaining(['DOWNSTREAM', 'UPSTREAM', 'BIDIRECTIONAL', 'UNKNOWN'])
    );
    expect(isValidImpactDirection('DOWNSTREAM')).toBe(true);

    expect(ALL_IMPACT_SEVERITIES).toEqual(
      expect.arrayContaining(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    );
    expect(isValidImpactSeverity('CRITICAL')).toBe(true);
  });

  it('should convert confidence levels and numeric scores bidirectionally', () => {
    expect(confidenceToNumeric('VERY_HIGH')).toBe(0.95);
    expect(confidenceToNumeric('HIGH')).toBe(0.8);
    expect(confidenceToNumeric('MEDIUM')).toBe(0.6);
    expect(confidenceToNumeric('LOW')).toBe(0.35);

    expect(numericToConfidence(0.95)).toBe('VERY_HIGH');
    expect(numericToConfidence(0.85)).toBe('HIGH');
    expect(numericToConfidence(0.65)).toBe('MEDIUM');
    expect(numericToConfidence(0.3)).toBe('LOW');
  });

  it('should instantiate custom error hierarchy correctly', () => {
    const err = new FeatureImpactError('Base error', 'BASE_CODE', { detail: 'test' });
    expect(err.name).toBe('FeatureImpactError');
    expect(err.code).toBe('BASE_CODE');
    expect(err.details).toEqual({ detail: 'test' });

    const refErr = new InvalidImpactReferenceError('Feature', 'feat_123');
    expect(refErr.name).toBe('InvalidImpactReferenceError');
    expect(refErr.message).toContain('feat_123');
    expect(refErr.code).toBe('INVALID_IMPACT_REFERENCE');
  });
});
