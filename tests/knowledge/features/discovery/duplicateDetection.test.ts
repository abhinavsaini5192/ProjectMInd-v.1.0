import { describe, it, expect } from 'vitest';
import { FeatureDuplicateDetector } from '../../../../src/knowledge/features/discovery/core/FeatureDuplicateDetector';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';

describe('Feature Discovery: Duplicate Detection', () => {
  it('should detect potential duplicate candidates sharing overlapping resources and names', () => {
    const detector = new FeatureDuplicateDetector();

    const c1: FeatureCandidate = {
      candidateId: 'fc_1',
      proposedName: 'User Authentication',
      proposedDescription: 'Auth system',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['SYMBOL'],
      references: [
        { referenceId: 'r1', resourceType: 'SYMBOL', resourceId: 'AuthService', role: 'IMPLEMENTATION', confidence: 0.9 },
        { referenceId: 'r2', resourceType: 'ENDPOINT', resourceId: 'POST /login', role: 'API', confidence: 0.9 },
      ],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const c2: FeatureCandidate = {
      candidateId: 'fc_2',
      proposedName: 'Authentication',
      proposedDescription: 'Login system',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['SYMBOL'],
      references: [
        { referenceId: 'r3', resourceType: 'SYMBOL', resourceId: 'AuthService', role: 'IMPLEMENTATION', confidence: 0.9 },
        { referenceId: 'r4', resourceType: 'ENDPOINT', resourceId: 'POST /login', role: 'API', confidence: 0.9 },
      ],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { reports, conflicts } = detector.detectDuplicates([c1, c2]);
    expect(reports.length).toBe(1);
    expect(reports[0]?.sharedResources).toContain('AuthService');
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });
});
