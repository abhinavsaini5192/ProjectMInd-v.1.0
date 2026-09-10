import { describe, it, expect } from 'vitest';
import { ImpactNormalizer } from '../../../../src/knowledge/features/impact/core/ImpactNormalizer.js';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import { ChangeSourceHelper } from '../../../../src/knowledge/features/impact/sources/ChangeSource.js';
import type { ImpactCandidate } from '../../../../src/knowledge/features/impact/models/ImpactCandidate.js';

describe('Phase 6.7 - Normalization', () => {
  it('should normalize raw file change input', () => {
    const raw = {
      filePath: 'src/services/AuthService.ts',
      changeType: 'MODIFIED',
      diffSnippet: '+ export function login() {}',
    };

    const normalized = ImpactNormalizer.normalizeChange(raw);
    expect(normalized.target.filePath).toBe('src/services/AuthService.ts');
    expect(normalized.target.targetType).toBe('FILE');
    expect(normalized.changeType).toBe('MODIFIED');
    expect(normalized.diffSnippet).toBeDefined();
  });

  it('should normalize raw symbol change input', () => {
    const raw = {
      symbolName: 'AuthService.login',
      filePath: 'src/services/AuthService.ts',
      changeType: 'SIGNATURE_CHANGED',
    };

    const normalized = ImpactNormalizer.normalizeChange(raw);
    expect(normalized.target.targetType).toBe('SYMBOL');
    expect(normalized.target.symbolName).toBe('AuthService.login');
    expect(normalized.changeType).toBe('SIGNATURE_CHANGED');
  });

  it('should normalize multiple candidate sources into ONE logical FeatureImpact with aggregated evidence (Section 33)', () => {
    const feature = ImpactTestHelper.createFeature('feat_auth', 'Authentication');
    const context = ImpactTestHelper.createContext({
      changes: [ImpactTestHelper.createChange('AuthService.login', 'SYMBOL')],
      features: [feature],
    });

    const ev1 = ChangeSourceHelper.createEvidence({
      source: 'MAPPING',
      sourceId: 'map_1',
      evidenceType: 'DIRECT_MAPPING',
      description: 'Direct symbol mapping',
      confidence: 0.95,
    });

    const ev2 = ChangeSourceHelper.createEvidence({
      source: 'DEPENDENCY',
      sourceId: 'dep_1',
      evidenceType: 'FEATURE_DEPENDENCY',
      description: 'Dependency graph confirmation',
      confidence: 0.9,
    });

    const ev3 = ChangeSourceHelper.createEvidence({
      source: 'BEHAVIOR',
      sourceId: 'flow_1',
      evidenceType: 'FLOW_CONFIRMATION',
      description: 'Behavior flow confirms execution',
      confidence: 0.85,
    });

    const cand1: ImpactCandidate = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_auth',
      impactType: 'DIRECT',
      scope: 'FEATURE',
      confidence: 'VERY_HIGH',
      direct: true,
      distance: 0,
      evidence: [ev1],
      contributingChanges: [{ targetId: 'AuthService.login', targetType: 'SYMBOL' }],
    });

    const cand2: ImpactCandidate = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_auth',
      impactType: 'DEPENDENCY',
      scope: 'FEATURE',
      confidence: 'HIGH',
      direct: false,
      distance: 1,
      evidence: [ev2],
      contributingChanges: [{ targetId: 'AuthService.login', targetType: 'SYMBOL' }],
    });

    const cand3: ImpactCandidate = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_auth',
      impactType: 'BEHAVIORAL',
      scope: 'FEATURE',
      confidence: 'HIGH',
      direct: false,
      distance: 1,
      evidence: [ev3],
      contributingChanges: [{ targetId: 'AuthService.login', targetType: 'SYMBOL' }],
    });

    // Normalize candidates
    const featureImpacts = ImpactNormalizer.normalizeFeatureCandidates([cand1, cand2, cand3], context);

    expect(featureImpacts).toHaveLength(1);
    const impact = featureImpacts[0]!;
    expect(impact.targetFeatureId).toBe('feat_auth');
    expect(impact.direct).toBe(true);
    expect(impact.distance).toBe(0);
    expect(impact.evidence).toHaveLength(3);
    expect(impact.evidence.map((e) => e.source)).toEqual(
      expect.arrayContaining(['MAPPING', 'DEPENDENCY', 'BEHAVIOR'])
    );
  });
});
