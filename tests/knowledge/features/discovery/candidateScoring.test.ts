import { describe, it, expect } from 'vitest';
import { FeatureCandidateScorer } from '../../../../src/knowledge/features/discovery/core/FeatureCandidateScorer';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';

describe('Feature Discovery: Candidate Scoring & Confidence', () => {
  it('should compute high score and VERY_HIGH confidence for rich cross-source evidence', () => {
    const scorer = new FeatureCandidateScorer();

    const candidate: FeatureCandidate = {
      candidateId: 'fc_rich',
      proposedName: 'Authentication',
      proposedDescription: 'Full auth capability',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [
        {
          evidenceId: 'e1',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /login',
          evidenceType: 'API_ROUTE',
          description: 'Login',
          targetCapability: 'Authentication',
          strength: 'VERY_STRONG',
          confidence: 0.95,
          timestamp: 1000,
        },
        {
          evidenceId: 'e2',
          sourceType: 'SYMBOL',
          sourceId: 'AuthService',
          evidenceType: 'IMPLEMENTATION_SYMBOL',
          description: 'Auth service',
          targetCapability: 'Authentication',
          strength: 'STRONG',
          confidence: 0.9,
          timestamp: 1000,
        },
        {
          evidenceId: 'e3',
          sourceType: 'TEST',
          sourceId: 'tests/auth.test.ts',
          evidenceType: 'TEST_SUITE',
          description: 'Auth test',
          targetCapability: 'Authentication',
          strength: 'STRONG',
          confidence: 0.9,
          timestamp: 1000,
        },
        {
          evidenceId: 'e4',
          sourceType: 'CONFIGURATION',
          sourceId: 'JWT_SECRET',
          evidenceType: 'CONFIGURATION_KEY',
          description: 'JWT config',
          targetCapability: 'Authentication',
          strength: 'MEDIUM',
          confidence: 0.7,
          timestamp: 1000,
        },
        {
          evidenceId: 'e5',
          sourceType: 'DEPENDENCY',
          sourceId: 'jsonwebtoken',
          evidenceType: 'DEPENDENCY_CLUSTER',
          description: 'JWT dependency',
          targetCapability: 'Authentication',
          strength: 'STRONG',
          confidence: 0.9,
          timestamp: 1000,
        },
      ],
      score: 0,
      confidence: { level: 'UNKNOWN' as any, score: 0, reasons: [] },
      sources: ['ENDPOINT', 'SYMBOL', 'TEST', 'CONFIGURATION', 'DEPENDENCY'],
      references: [],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { score, confidence, breakdown } = scorer.scoreCandidate(candidate);

    expect(score).toBeGreaterThanOrEqual(0.70);
    expect(confidence.level).toMatch(/HIGH|VERY_HIGH/);
    expect(breakdown.coherenceScore).toBe(0.1); // Diversity bonus applied for >= 3 sources
    expect(confidence.reasons.length).toBeGreaterThan(0);
  });
});
