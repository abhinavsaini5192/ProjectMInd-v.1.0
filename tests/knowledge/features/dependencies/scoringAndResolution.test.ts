import { describe, it, expect } from 'vitest';
import { FeatureRelationshipScorer } from '../../../../src/knowledge/features/dependencies/core/FeatureRelationshipScorer';
import { FeatureRelationshipResolver } from '../../../../src/knowledge/features/dependencies/core/FeatureRelationshipResolver';
import type { FeatureRelationshipCandidate } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipCandidate';

describe('Feature Dependency Graph: Scoring and Resolution', () => {
  const scorer = new FeatureRelationshipScorer();
  const resolver = new FeatureRelationshipResolver();

  it('should preserve authoritative single-source baseline in scoring', () => {
    const candidate: FeatureRelationshipCandidate = {
      candidateId: 'cand_ep',
      sourceFeatureId: 'feat_billing',
      targetFeatureId: 'feat_auth',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_ep',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /charge',
          evidenceType: 'MIDDLEWARE',
          description: 'Auth required',
          strength: 0.95,
          confidence: 0.95,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.95,
      confidence: { level: 'VERY_HIGH', score: 0.95, reasons: [] },
      sources: ['ENDPOINT'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const res = scorer.scoreCandidate(candidate);
    expect(res.score).toBe(0.95);
    expect(res.confidence.level).toBe('VERY_HIGH');
  });

  it('should apply cross-source diversity bonus when supported by multiple independent sources', () => {
    const candidate: FeatureRelationshipCandidate = {
      candidateId: 'cand_multi',
      sourceFeatureId: 'feat_billing',
      targetFeatureId: 'feat_auth',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /charge',
          evidenceType: 'MIDDLEWARE',
          description: 'Auth required',
          strength: 0.8,
          confidence: 0.8,
          metadata: {},
          timestamp: 0,
        },
        {
          evidenceId: 'ev_2',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'import AuthService',
          evidenceType: 'IMPORT',
          description: 'Imports AuthService',
          strength: 0.8,
          confidence: 0.8,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ENDPOINT', 'CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const res = scorer.scoreCandidate(candidate);
    expect(res.breakdown.coherenceScore).toBe(0.1);
    expect(res.score).toBeGreaterThanOrEqual(0.9);
  });

  it('should deduplicate candidates on same edge and apply role hierarchy', () => {
    const cand1: FeatureRelationshipCandidate = {
      candidateId: 'cand_1',
      sourceFeatureId: 'feat_billing',
      targetFeatureId: 'feat_user',
      proposedType: 'USES',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'DATA',
          sourceId: 'UserEntity',
          evidenceType: 'FOREIGN_KEY',
          description: 'user_id fk',
          strength: 0.75,
          confidence: 0.75,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.75,
      confidence: { level: 'HIGH', score: 0.75, reasons: [] },
      sources: ['DATA'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const cand2: FeatureRelationshipCandidate = {
      candidateId: 'cand_2',
      sourceFeatureId: 'feat_billing',
      targetFeatureId: 'feat_user',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_2',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'UserService.ts',
          evidenceType: 'IMPORT',
          description: 'Imports UserService',
          strength: 0.85,
          confidence: 0.85,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.85,
      confidence: { level: 'HIGH', score: 0.85, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const { resolvedRelationships } = resolver.resolve([cand1, cand2]);
    expect(resolvedRelationships.length).toBe(1);
    expect(resolvedRelationships[0].relationshipType).toBe('DEPENDS_ON'); // Dominant type
    expect(resolvedRelationships[0].evidence.length).toBe(2);
  });

  it('should flag conflict when contradictory types (PROVIDES vs CONSUMES) are proposed', () => {
    const cand1: FeatureRelationshipCandidate = {
      candidateId: 'c1',
      sourceFeatureId: 'feat_a',
      targetFeatureId: 'feat_b',
      proposedType: 'PROVIDES',
      direction: 'DIRECTED',
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ARCHITECTURE'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const cand2: FeatureRelationshipCandidate = {
      candidateId: 'c2',
      sourceFeatureId: 'feat_a',
      targetFeatureId: 'feat_b',
      proposedType: 'CONSUMES',
      direction: 'DIRECTED',
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ENDPOINT'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const { conflicts } = resolver.resolve([cand1, cand2]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('WARNING');
    expect(conflicts[0].reason).toContain('Contradictory relationship types');
  });

  it('should detect CRITICAL conflict when reciprocal hard dependencies exist', () => {
    const candAtoB: FeatureRelationshipCandidate = {
      candidateId: 'c_ab',
      sourceFeatureId: 'feat_a',
      targetFeatureId: 'feat_b',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [],
      score: 0.9,
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const candBtoA: FeatureRelationshipCandidate = {
      candidateId: 'c_ba',
      sourceFeatureId: 'feat_b',
      targetFeatureId: 'feat_a',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [],
      score: 0.9,
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const { conflicts } = resolver.resolve([candAtoB, candBtoA]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('CRITICAL');
    expect(conflicts[0].reason).toContain('Direct circular dependency');
  });
});
