import { describe, it, expect } from 'vitest';
import { VALID_FEATURE_RELATIONSHIP_TYPES } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipType';
import { scoreToFeatureRelationshipConfidenceLevel } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipConfidence';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';
import type { FeatureRelationshipCandidate } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipCandidate';
import { DEFAULT_RELATIONSHIP_WEIGHTS } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipScore';

describe('Feature Dependency Graph: Models & Types', () => {
  it('should define all 18 semantic relationship types', () => {
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('DEPENDS_ON');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('REQUIRED_BY');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('PROVIDES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('CONSUMES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('USES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('INTEGRATES_WITH');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('EXTENDS');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('SPECIALIZES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('COMPOSES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('COORDINATES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('SHARES_RESOURCE');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('SHARES_DATA');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('AUTHORIZES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('TRIGGERS');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('FEEDS');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('OBSERVES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('VERIFIES');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES).toContain('ASSOCIATED_WITH');
    expect(VALID_FEATURE_RELATIONSHIP_TYPES.length).toBe(18);
  });

  it('should correctly map numeric scores to confidence levels', () => {
    expect(scoreToFeatureRelationshipConfidenceLevel(0.95)).toBe('VERY_HIGH');
    expect(scoreToFeatureRelationshipConfidenceLevel(0.85)).toBe('HIGH');
    expect(scoreToFeatureRelationshipConfidenceLevel(0.75)).toBe('HIGH');
    expect(scoreToFeatureRelationshipConfidenceLevel(0.55)).toBe('MEDIUM');
    expect(scoreToFeatureRelationshipConfidenceLevel(0.35)).toBe('LOW');
    expect(scoreToFeatureRelationshipConfidenceLevel(0.15)).toBe('VERY_LOW');
  });

  it('should construct valid FeatureRelationship with full provenance', () => {
    const rel: FeatureRelationship = {
      relationshipId: 'rel_auth_user',
      sourceFeatureId: 'feat_auth' as any,
      targetFeatureId: 'feat_user' as any,
      relationshipType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      confidence: { level: 'VERY_HIGH', score: 0.95, reasons: ['Direct API endpoint and code import calls'] },
      score: 0.95,
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'ENDPOINT',
          sourceId: 'GET /api/users/profile',
          evidenceType: 'ENDPOINT_SECURITY_MIDDLEWARE',
          description: 'Auth middleware protects users profile',
          strength: 0.95,
          confidence: 0.95,
          metadata: {},
          timestamp: Date.now(),
        },
      ],
      source: 'DISCOVERED',
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };

    expect(rel.relationshipId).toBe('rel_auth_user');
    expect(rel.relationshipType).toBe('DEPENDS_ON');
    expect(rel.direction).toBe('DIRECTED');
    expect(rel.active).toBe(true);
    expect(rel.evidence.length).toBe(1);
  });

  it('should support candidate lifecycle states', () => {
    const candidate: FeatureRelationshipCandidate = {
      candidateId: 'cand_1',
      sourceFeatureId: 'feat_billing',
      targetFeatureId: 'feat_auth',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(candidate.status).toBe('DETECTED');
    candidate.status = 'VALIDATED';
    expect(candidate.status).toBe('VALIDATED');
    candidate.status = 'PROMOTED';
    expect(candidate.status).toBe('PROMOTED');
  });

  it('should define default scoring weights for all 10 sources', () => {
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.ENDPOINT).toBe(0.25);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.CODE_DEPENDENCY).toBe(0.2);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.INTEGRATION).toBe(0.15);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.ARCHITECTURE).toBe(0.12);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.DATA).toBe(0.1);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.MODULE).toBe(0.08);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.SHARED_RESOURCE).toBe(0.05);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.CONFIGURATION).toBe(0.04);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.TEST).toBe(0.03);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.sourceWeights.HISTORY).toBe(0.02);
    expect(DEFAULT_RELATIONSHIP_WEIGHTS.diversityBonus).toBe(0.1);
  });
});
