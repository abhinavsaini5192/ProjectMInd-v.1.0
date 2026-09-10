import { describe, it, expect } from 'vitest';
import { ImpactScorer } from '../../../../src/knowledge/features/impact/core/ImpactScorer.js';
import { ChangeSourceHelper } from '../../../../src/knowledge/features/impact/sources/ChangeSource.js';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import type { FeatureHealth } from '../../../../src/knowledge/features/health/models/FeatureHealth.js';

describe('Phase 6.7 - Scoring & Prioritization', () => {
  it('should compute higher scores for direct impacts and attenuate with distance', () => {
    const scorer = new ImpactScorer();
    const context = ImpactTestHelper.createContext({ changes: [] });

    const ev = ChangeSourceHelper.createEvidence({
      source: 'MAPPING',
      sourceId: '1',
      evidenceType: 'TEST',
      description: 'test',
      confidence: 0.9,
    });

    const directCand = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_1',
      impactType: 'DIRECT',
      scope: 'FEATURE',
      confidence: 'VERY_HIGH',
      direct: true,
      distance: 0,
      evidence: [ev],
      contributingChanges: [],
    });

    const indirectCandD1 = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_2',
      impactType: 'INDIRECT',
      scope: 'FEATURE',
      confidence: 'HIGH',
      direct: false,
      distance: 1,
      evidence: [ev],
      contributingChanges: [],
    });

    const indirectCandD2 = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_3',
      impactType: 'INDIRECT',
      scope: 'FEATURE',
      confidence: 'MEDIUM',
      direct: false,
      distance: 2,
      evidence: [ev],
      contributingChanges: [],
    });

    const scoreDirect = scorer.scoreImpact(directCand, context);
    const scoreD1 = scorer.scoreImpact(indirectCandD1, context);
    const scoreD2 = scorer.scoreImpact(indirectCandD2, context);

    expect(scoreDirect).toBeGreaterThan(scoreD1);
    expect(scoreD1).toBeGreaterThan(scoreD2);
    expect(scoreDirect).toBeGreaterThanOrEqual(80);
  });

  it('should prioritize high criticality and high risk features', () => {
    const scorer = new ImpactScorer();

    const healthHighCrit: Partial<FeatureHealth> = {
      featureId: 'feat_high_crit',
      criticality: {
        score: 90,
        level: 'CRITICAL',
        metrics: {} as any,
        confidence: 0.9,
        evidence: [],
      },
      riskAssessment: {
        overallRiskScore: 75,
        highestRiskSeverity: 'HIGH',
        risks: [],
        riskCount: 2,
        confidence: 0.9,
        evaluatedAt: Date.now(),
      },
    };

    const healthLowCrit: Partial<FeatureHealth> = {
      featureId: 'feat_low_crit',
      criticality: {
        score: 20,
        level: 'LOW',
        metrics: {} as any,
        confidence: 0.9,
        evidence: [],
      },
      riskAssessment: {
        overallRiskScore: 10,
        highestRiskSeverity: 'LOW',
        risks: [],
        riskCount: 0,
        confidence: 0.9,
        evaluatedAt: Date.now(),
      },
    };

    const context = ImpactTestHelper.createContext({
      changes: [],
      health: [healthHighCrit as FeatureHealth, healthLowCrit as FeatureHealth],
    });

    const ev = ChangeSourceHelper.createEvidence({
      source: 'MAPPING',
      sourceId: '1',
      evidenceType: 'TEST',
      description: 'test',
      confidence: 0.9,
    });

    const candHigh = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_high_crit',
      impactType: 'DIRECT',
      scope: 'FEATURE',
      confidence: 'VERY_HIGH',
      direct: true,
      distance: 0,
      evidence: [ev],
      contributingChanges: [],
    });

    const candLow = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_low_crit',
      impactType: 'DIRECT',
      scope: 'FEATURE',
      confidence: 'VERY_HIGH',
      direct: true,
      distance: 0,
      evidence: [ev],
      contributingChanges: [],
    });

    const scoreHigh = scorer.scoreImpact(candHigh, context);
    const scoreLow = scorer.scoreImpact(candLow, context);

    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it('should sort impacts deterministically by score descending and directness', () => {
    const scorer = new ImpactScorer();

    const imp1 = {
      impactId: '1',
      targetFeatureId: 'feat_a',
      score: 60,
      direct: false,
      distance: 1,
    } as any;

    const imp2 = {
      impactId: '2',
      targetFeatureId: 'feat_b',
      score: 95,
      direct: true,
      distance: 0,
    } as any;

    const imp3 = {
      impactId: '3',
      targetFeatureId: 'feat_c',
      score: 80,
      direct: false,
      distance: 1,
    } as any;

    const sorted = scorer.prioritizeImpacts([imp1, imp2, imp3]);
    expect(sorted.map((s) => s.targetFeatureId)).toEqual(['feat_b', 'feat_c', 'feat_a']);
  });
});
