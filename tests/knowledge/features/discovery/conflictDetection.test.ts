import { describe, it, expect } from 'vitest';
import { FeatureDuplicateDetector } from '../../../../src/knowledge/features/discovery/core/FeatureDuplicateDetector';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';
import type { FeatureResourceType, FeatureReferenceRole } from '../../../../src/knowledge/features/models/FeatureReference';

describe('Feature Discovery: Conflict & Collision Detection', () => {
  const detector = new FeatureDuplicateDetector();

  it('should detect RESOURCE_COLLISION when candidates claim the same primary entrypoint or endpoint', () => {
    const candidateA: FeatureCandidate = {
      candidateId: 'fc_1',
      proposedName: 'AuthService',
      proposedDescription: 'Authentication service',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ENDPOINT'],
      references: [
        {
          referenceId: 'ref_1',
          resourceType: 'ENDPOINT',
          resourceId: 'POST /api/v1/auth/login',
          role: 'ENTRY_POINT',
          confidence: 0.95,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const candidateB: FeatureCandidate = {
      candidateId: 'fc_2',
      proposedName: 'SessionManager',
      proposedDescription: 'Session manager claiming same login endpoint',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.75,
      confidence: { level: 'HIGH', score: 0.75, reasons: [] },
      sources: ['ENDPOINT'],
      references: [
        {
          referenceId: 'ref_2',
          resourceType: 'ENDPOINT',
          resourceId: 'POST /api/v1/auth/login',
          role: 'ENTRY_POINT',
          confidence: 0.9,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { conflicts, reports } = detector.detectDuplicates([candidateA, candidateB]);

    expect(conflicts.length).toBeGreaterThan(0);
    const resourceCollision = conflicts.find((c) => c.type === 'RESOURCE_COLLISION');
    expect(resourceCollision).toBeDefined();
    expect(resourceCollision?.competingCandidateIds).toContain('fc_1');
    expect(resourceCollision?.competingCandidateIds).toContain('fc_2');
    expect(resourceCollision?.description).toContain('POST /api/v1/auth/login');
  });

  it('should detect SCOPE_MISMATCH when candidates have differing workspaces or repositories', () => {
    const candidateA: FeatureCandidate = {
      candidateId: 'fc_ws1',
      proposedName: 'PaymentModule',
      proposedDescription: 'Payment module ws 1',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['MODULE'],
      references: [
        {
          referenceId: 'ref_m1',
          resourceType: 'MODULE',
          resourceId: 'src/payments',
          role: 'IMPLEMENTATION',
          confidence: 0.9,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const candidateB: FeatureCandidate = {
      candidateId: 'fc_ws2',
      proposedName: 'PaymentModule',
      proposedDescription: 'Payment module ws 2',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-2', repositoryId: 'repo-2' },
      evidence: [],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['MODULE'],
      references: [
        {
          referenceId: 'ref_m2',
          resourceType: 'MODULE',
          resourceId: 'src/payments',
          role: 'IMPLEMENTATION',
          confidence: 0.9,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const { conflicts } = detector.detectDuplicates([candidateA, candidateB]);

    const scopeConflict = conflicts.find((c) => c.type === 'SCOPE_MISMATCH');
    expect(scopeConflict).toBeDefined();
    expect(scopeConflict?.competingCandidateIds).toContain('fc_ws1');
    expect(scopeConflict?.competingCandidateIds).toContain('fc_ws2');
  });
});
