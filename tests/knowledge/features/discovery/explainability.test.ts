import { describe, it, expect } from 'vitest';
import { FeatureDiscoveryEngine } from '../../../../src/knowledge/features/discovery/core/FeatureDiscoveryEngine';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { FeatureDiscoveryError } from '../../../../src/knowledge/features/discovery/errors/FeatureDiscoveryError';

describe('Feature Discovery: Explainability', () => {
  it('should generate structured explanation of a candidate without raw internal chain-of-thought', () => {
    const engine = new FeatureDiscoveryEngine();

    const candidate: FeatureCandidate = {
      candidateId: 'cand_explain_01',
      proposedName: 'Authentication',
      proposedDescription: 'User authentication and tokens',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [
        {
          evidenceId: 'e1',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /api/auth/login',
          evidenceType: 'API_ROUTE',
          description: 'Login route',
          targetCapability: 'Authentication',
          strength: 'VERY_STRONG',
          confidence: 0.95,
          timestamp: 1000,
        },
        {
          evidenceId: 'e2',
          sourceType: 'TEST',
          sourceId: 'tests/auth.test.ts',
          evidenceType: 'TEST_SUITE',
          description: 'Auth test',
          targetCapability: 'Authentication',
          strength: 'STRONG',
          confidence: 0.9,
          timestamp: 1000,
        },
      ],
      score: 0.88,
      confidence: {
        level: 'VERY_HIGH',
        score: 0.88,
        reasons: ['Direct API endpoints contributed 0.25', 'Test suites contributed 0.20'],
      },
      sources: ['ENDPOINT', 'TEST'],
      references: [],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    engine.registerCandidate(candidate);

    const explanation = engine.explainCandidate('cand_explain_01');

    expect(explanation).toBeDefined();
    expect(explanation.candidateId).toBe('cand_explain_01');
    expect(explanation.proposedName).toBe('Authentication');
    expect(explanation.score).toBe(0.88);
    expect(explanation.confidence.level).toBe('VERY_HIGH');
    expect(explanation.sources).toEqual(['ENDPOINT', 'TEST']);
    expect(explanation.evidenceCount).toBe(2);
    expect(explanation.reasoningSummary).toBeDefined();
    expect(explanation.reasoningSummary).toContain('Confidence: VERY_HIGH');
  });

  it('should throw FeatureDiscoveryError when explaining a non-existent candidate', () => {
    const engine = new FeatureDiscoveryEngine();

    expect(() => engine.explainCandidate('non_existent_id')).toThrow(FeatureDiscoveryError);
  });
});
